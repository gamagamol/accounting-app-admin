use std::sync::Arc;

use axum::Router;
use axum::routing::{delete, get, post};

use crate::app::audit::handler::AuditHandler;
use crate::app::pending::handler::PendingHandler;
use crate::app::user::handler::UserHandler;

#[derive(Clone)]
pub struct Handlers {
    pub user: Arc<UserHandler>,
    pub audit: Arc<AuditHandler>,
    pub pending: Arc<PendingHandler>,
}

pub struct Routes;

impl Routes {
    pub fn setup(router: Router, handlers: Handlers) -> Router {
        let user_routes = Router::new()
            .route("/users", get(UserHandler::list).post(UserHandler::create))
            .route(
                "/users/{id}",
                get(UserHandler::get)
                    .put(UserHandler::update)
                    .delete(UserHandler::delete),
            )
            .with_state(handlers.user);

        let audit_routes = Router::new()
            .route(
                "/audit-logs",
                get(AuditHandler::list).post(AuditHandler::create),
            )
            .route(
                "/audit-logs/{id}",
                get(AuditHandler::get).delete(AuditHandler::delete),
            )
            .route(
                "/audit-logs/entity/{entity_type}/{entity_id}",
                delete(AuditHandler::delete_for_entity),
            )
            .with_state(handlers.audit);

        let pending_routes = Router::new()
            .route(
                "/pending",
                get(PendingHandler::list).post(PendingHandler::create),
            )
            .route("/pending/{transaction_type}/{id}", get(PendingHandler::get))
            .route(
                "/pending/{transaction_type}/{id}/approve",
                post(PendingHandler::approve),
            )
            .route(
                "/pending/{transaction_type}/{id}/reject",
                post(PendingHandler::reject),
            )
            .with_state(handlers.pending);

        router.nest(
            "/api",
            user_routes.merge(audit_routes).merge(pending_routes),
        )
    }
}
