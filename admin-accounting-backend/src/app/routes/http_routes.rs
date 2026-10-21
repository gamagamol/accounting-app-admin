use std::sync::Arc;

use axum::Router;
use axum::routing::get;

use crate::app::user::handler::UserHandler;

#[derive(Clone)]
pub struct Handlers {
    pub user: Arc<UserHandler>,
}

pub struct Routes;

impl Routes {
    pub fn setup(router: Router, handlers: Handlers) -> Router {
        router.nest(
            "/api",
            Router::new()
                .route("/users", get(UserHandler::list).post(UserHandler::create))
                .route(
                    "/users/{id}",
                    get(UserHandler::get)
                        .put(UserHandler::update)
                        .delete(UserHandler::delete),
                )
                .with_state(handlers.user),
        )
    }
}
