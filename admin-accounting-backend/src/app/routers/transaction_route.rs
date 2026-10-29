use axum::Router;
use axum::routing::{get, post};

use crate::app::modules::transactions::TransactionHandler;

pub fn routes() -> Router {
    Router::new()
        .route(
            "/transactions/{document_type}",
            get(TransactionHandler::list).post(TransactionHandler::create),
        )
        .route(
            "/transactions/{document_type}/{id}",
            get(TransactionHandler::get),
        )
        .route(
            "/transactions/{document_type}/{id}/approve",
            post(TransactionHandler::approve),
        )
}
