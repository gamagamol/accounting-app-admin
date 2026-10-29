use std::sync::Arc;

use axum::extract::Extension;
use axum::routing::get;
use axum::{Json, Router};
use tower_http::trace::TraceLayer;

use super::audit_log_routes;
use super::budgeting_routes;
use super::journal_routes;
use super::master_data_routes;
use super::period_routes;
use super::report_route;
use super::transaction_route;
use crate::app::modules::audit_log::IAuditLogUsecase;
use crate::app::modules::budgeting::IBudgetingUsecase;
use crate::app::modules::journal::IJournalUsecase;
use crate::app::modules::master_data::IMasterDataCrudUsecase;
use crate::app::modules::master_data::IMasterDataUsecase;
use crate::app::modules::period::IPeriodUsecase;
use crate::app::modules::product_category::IProductCategoryUsecase;
use crate::app::modules::reports::IReportUsecase;
use crate::app::modules::transactions::ITransactionUsecase;
use crate::app::modules::users::IUserUsecase;
use crate::infra::Config;
use crate::pkg::constans::constants::{API_PREFIX, HEALTH_PATH};
use crate::pkg::response::response_success::ApiResponse;

/// Kumpulan dependency yang dibutuhkan route layer.
#[derive(Clone)]
pub struct RouteDeps {
    pub config: Arc<Config>,
    pub user_usecase: Arc<dyn IUserUsecase>,
    pub audit_log_usecase: Arc<dyn IAuditLogUsecase>,
    pub product_category_usecase: Arc<dyn IProductCategoryUsecase>,
    pub master_data_usecase: Arc<dyn IMasterDataUsecase>,
    pub master_data_crud_usecase: Arc<dyn IMasterDataCrudUsecase>,
    pub transaction_usecase: Arc<dyn ITransactionUsecase>,
    pub budgeting_usecase: Arc<dyn IBudgetingUsecase>,
    pub report_usecase: Arc<dyn IReportUsecase>,
    pub journal_usecase: Arc<dyn IJournalUsecase>,
    pub period_usecase: Arc<dyn IPeriodUsecase>,
}

/// Init seluruh route aplikasi.
///
/// JWT sengaja belum dipasang; CORS terbuka agar frontend lokal/Docker bisa
/// langsung memanggil API tanpa login.
pub fn build_routes(deps: RouteDeps) -> Router {
    let api_routes = Router::new()
        .merge(master_data_routes::routes())
        .merge(audit_log_routes::routes())
        .merge(transaction_route::routes())
        .merge(budgeting_routes::routes())
        .merge(report_route::routes())
        .merge(journal_routes::routes())
        .merge(period_routes::routes());

    let health_config = deps.config.clone();
    let health_route = Router::new().route(
        HEALTH_PATH,
        get(move || {
            let config = health_config.clone();
            async move {
                Json(ApiResponse::success(
                    "Service is healthy",
                    serde_json::json!({
                        "service": config.app_name,
                        "env": config.app_env,
                        "database": "postgres",
                        "redis": true,
                        "mongo": true,
                    }),
                ))
            }
        }),
    );

    Router::new()
        .nest(API_PREFIX, api_routes)
        .merge(health_route)
        .layer(Extension(deps.config))
        .layer(Extension(deps.user_usecase))
        .layer(Extension(deps.audit_log_usecase))
        .layer(Extension(deps.product_category_usecase))
        .layer(Extension(deps.master_data_usecase))
        .layer(Extension(deps.master_data_crud_usecase))
        .layer(Extension(deps.transaction_usecase))
        .layer(Extension(deps.budgeting_usecase))
        .layer(Extension(deps.report_usecase))
        .layer(Extension(deps.journal_usecase))
        .layer(Extension(deps.period_usecase))
        .layer(crate::app::middleware::cors::cors_layer())
        .layer(TraceLayer::new_for_http())
}
