use axum::Router;
use axum::routing::{delete, get};

use crate::app::modules::audit_log::AuditLogHandler;

/// Route audit log.
pub fn routes() -> Router {
    Router::new()
        .route(
            "/audit-logs",
            get(AuditLogHandler::list).post(AuditLogHandler::create),
        )
        .route(
            "/audit-logs/{id}",
            get(AuditLogHandler::get_by_id).delete(AuditLogHandler::delete),
        )
        .route(
            "/audit-logs/entity/{entity_type}/{entity_id}",
            delete(AuditLogHandler::delete_for_entity),
        )
}
