use axum::Router;
use axum::routing::get;

use crate::app::modules::audit_log::AuditLogHandler;

/// Route audit log.
///
/// Audit is append-only, so no DELETE route is registered.
pub fn routes() -> Router {
    Router::new()
        .route(
            "/audit-logs",
            get(AuditLogHandler::list).post(AuditLogHandler::create),
        )
        .route(
            "/audit-logs/timeline/{root_transaction_id}",
            get(AuditLogHandler::timeline),
        )
        .route("/audit-logs/{id}", get(AuditLogHandler::get_by_id))
}
