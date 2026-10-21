use std::net::SocketAddr;
use std::sync::Arc;

use anyhow::{Context, Result};
use axum::Json;
use axum::Router;
use axum::routing::get;
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use tower_http::request_id::{MakeRequestUuid, PropagateRequestIdLayer, SetRequestIdLayer};

use crate::app::container::Container;
use crate::app::middleware;
use crate::app::modules;
use crate::app::routes::{Handlers, Routes};
use crate::app::user::handler::UserHandler;
use crate::config::Config;
use crate::pkg::response::ApiResponse;

/// Builds the HTTP application. It is public so integration tests can use
/// `tower::ServiceExt::oneshot` without binding a real port.
pub fn build_app(config: Arc<Config>, user_handler: Arc<UserHandler>) -> Router {
    let api = Routes::setup(Router::new(), Handlers { user: user_handler });

    let health_config = config.clone();
    let health = Router::new().route(
        "/health",
        get(move || {
            let config = health_config.clone();
            async move {
                Json(ApiResponse::success(
                    "Service is healthy",
                    serde_json::json!({
                        "service": config.app_name,
                        "env": config.app_env,
                        "database": config.db_driver,
                        "redis": config.redis_enabled,
                    }),
                ))
            }
        }),
    );

    let layers = ServiceBuilder::new()
        .layer(SetRequestIdLayer::x_request_id(MakeRequestUuid))
        .layer(PropagateRequestIdLayer::x_request_id())
        .layer(middleware::request_logger())
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        );

    Router::new().merge(api).merge(health).layer(layers)
}

/// Starts the HTTP server and shuts it down gracefully on Ctrl+C/SIGTERM.
pub async fn run(config: Config) -> Result<()> {
    let config = Arc::new(config);
    crate::infra::logging::init(config.as_ref());

    tracing::info!(
        app = %config.app_name,
        env = %config.app_env,
        "starting service"
    );

    let container = Container::new(config.clone()).await?;
    let user_module = modules::init_user(container.user_repo.clone());
    let app = build_app(config.clone(), user_module.handler.clone());

    let address = SocketAddr::from(([0, 0, 0, 0], config.app_port));
    let listener = TcpListener::bind(address)
        .await
        .with_context(|| format!("bind {address}"))?;

    tracing::info!(port = config.app_port, "http server listening");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .context("serve http")?;

    tracing::info!("http server stopped");
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        if let Err(error) = tokio::signal::ctrl_c().await {
            tracing::error!(error = %error, "failed to listen for ctrl+c");
        }
    };

    #[cfg(unix)]
    let terminate = async {
        match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
            Ok(mut signal) => {
                signal.recv().await;
            }
            Err(error) => {
                tracing::error!(error = %error, "failed to listen for SIGTERM");
            }
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("shutdown signal received");
}
