use axum::Router;
use axum::routing::{get, post};

use crate::app::modules::period::PeriodHandler;

pub fn routes() -> Router {
    Router::new()
        .route(
            "/periods",
            get(PeriodHandler::list).post(PeriodHandler::create),
        )
        .route(
            "/periods/{id}",
            get(PeriodHandler::get)
                .put(PeriodHandler::update)
                .delete(PeriodHandler::delete),
        )
        .route("/periods/{id}/close", post(PeriodHandler::close))
        .route("/periods/{id}/reopen", post(PeriodHandler::reopen))
}
