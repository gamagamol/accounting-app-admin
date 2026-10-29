use std::net::SocketAddr;
use std::sync::Arc;

use anyhow::{Context, Result};
use tokio::net::TcpListener;
use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

use admin_accounting_backend::app::build_routes;
use admin_accounting_backend::app::modules::audit_log::{
    AuditLogRepo, AuditLogUsecase, IAuditLogUsecase,
};
use admin_accounting_backend::app::modules::budgeting::{
    BudgetingRepo, BudgetingUsecase, IBudgetingUsecase,
};
use admin_accounting_backend::app::modules::journal::{
    IJournalUsecase, JournalRepo, JournalUsecase,
};
use admin_accounting_backend::app::modules::master_data::{
    IMasterDataCrudUsecase, IMasterDataUsecase, MasterDataCrudRepo, MasterDataCrudUsecase,
    MasterDataRepo, MasterDataUsecase,
};
use admin_accounting_backend::app::modules::period::{IPeriodUsecase, PeriodRepo, PeriodUsecase};
use admin_accounting_backend::app::modules::product_category::{
    IProductCategoryUsecase, ProductCategoryRepo, ProductCategoryUsecase,
};
use admin_accounting_backend::app::modules::reports::{IReportUsecase, ReportRepo, ReportUsecase};
use admin_accounting_backend::app::modules::transactions::{
    ITransactionUsecase, TransactionRepo, TransactionUsecase,
};
use admin_accounting_backend::app::modules::users::{IUserUsecase, UserUsecase, UsersRepo};
use admin_accounting_backend::app::routers::routes::RouteDeps;
use admin_accounting_backend::infra::{Config, Database};

#[tokio::main]
async fn main() -> Result<()> {
    let config = Config::from_env()?;
    init_tracing(&config.log_level);

    tracing::info!(
        app = %config.app_name,
        env = %config.app_env,
        "starting application composition root"
    );

    // 1. Koneksi database (Postgres + Redis + Mongo)
    let database = Database::init(&config).await?;

    // 2. Repository — tinggal ambil client dari Database.
    let user_repo = Arc::new(UsersRepo::new(
        database.postgres_client(),
        database.redis_client(),
    ));

    let audit_repo = Arc::new(
        AuditLogRepo::new(
            database.postgres_client(),
            database.mongo_client(),
            database.redis_client(),
            &config.mongo_audit_collection,
        )
        .await,
    );

    // 3. Usecase
    let user_usecase: Arc<dyn IUserUsecase> = Arc::new(UserUsecase::new(user_repo));
    let audit_log_usecase: Arc<dyn IAuditLogUsecase> = Arc::new(AuditLogUsecase::new(audit_repo));

    let pool = database.postgres_pool();

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .context("failed to apply database migrations")?;
    tracing::info!("database migrations are up to date");

    let product_category_repo = Arc::new(ProductCategoryRepo::new(database.postgres_client()));
    let product_category_usecase: Arc<dyn IProductCategoryUsecase> =
        Arc::new(ProductCategoryUsecase::new(product_category_repo));

    let master_data_repo = Arc::new(MasterDataRepo::new(pool.clone()));
    let master_data_usecase: Arc<dyn IMasterDataUsecase> =
        Arc::new(MasterDataUsecase::new(master_data_repo));

    let master_data_crud_repo = Arc::new(MasterDataCrudRepo::new(pool.clone()));
    let master_data_crud_usecase: Arc<dyn IMasterDataCrudUsecase> =
        Arc::new(MasterDataCrudUsecase::new(master_data_crud_repo));

    let transaction_repo = Arc::new(TransactionRepo::new(pool.clone()));
    let transaction_usecase: Arc<dyn ITransactionUsecase> = Arc::new(TransactionUsecase::new(
        transaction_repo,
        audit_log_usecase.clone(),
    ));

    let budgeting_repo = Arc::new(BudgetingRepo::new(pool.clone()));
    let budgeting_usecase: Arc<dyn IBudgetingUsecase> = Arc::new(BudgetingUsecase::new(
        budgeting_repo,
        audit_log_usecase.clone(),
    ));

    let report_repo = Arc::new(ReportRepo::new(pool.clone()));
    let report_usecase: Arc<dyn IReportUsecase> = Arc::new(ReportUsecase::new(report_repo));

    let journal_repo = Arc::new(JournalRepo::new(pool.clone()));
    let journal_usecase: Arc<dyn IJournalUsecase> =
        Arc::new(JournalUsecase::new(journal_repo, audit_log_usecase.clone()));

    let period_repo = Arc::new(PeriodRepo::new(pool));
    let period_usecase: Arc<dyn IPeriodUsecase> = Arc::new(PeriodUsecase::new(period_repo));

    // 4. Routes
    let app = build_routes(RouteDeps {
        config: Arc::new(config.clone()),
        user_usecase,
        audit_log_usecase,
        product_category_usecase,
        master_data_usecase,
        master_data_crud_usecase,
        transaction_usecase,
        budgeting_usecase,
        report_usecase,
        journal_usecase,
        period_usecase,
    });

    // 5. Jalankan server
    let address = SocketAddr::from(([0, 0, 0, 0], config.app_port));
    let listener = TcpListener::bind(address)
        .await
        .with_context(|| format!("failed to bind port {address}"))?;

    tracing::info!(port = config.app_port, "http server listening");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .context("server error")?;

    tracing::info!("http server stopped gracefully");
    Ok(())
}

fn init_tracing(log_level: &str) {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(log_level));

    let _ = tracing_subscriber::registry()
        .with(filter)
        .with(tracing_subscriber::fmt::layer().with_target(true).compact())
        .try_init();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
