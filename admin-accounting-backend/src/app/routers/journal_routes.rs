use axum::Router;
use axum::routing::{get, post};

use crate::app::modules::journal::JournalHandler;

pub fn routes() -> Router {
    Router::new()
        .route(
            "/journals",
            get(JournalHandler::list).post(JournalHandler::create),
        )
        .route(
            "/journals/{id}",
            get(JournalHandler::get)
                .put(JournalHandler::update)
                .delete(JournalHandler::delete),
        )
        .route("/journals/{id}/post", post(JournalHandler::post))
        .route("/journals/{id}/unpost", post(JournalHandler::unpost))
}
