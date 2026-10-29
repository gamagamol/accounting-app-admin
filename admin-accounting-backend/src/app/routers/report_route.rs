use axum::Router;
use axum::routing::get;

use crate::app::modules::reports::ReportHandler;

pub fn routes() -> Router {
    Router::new()
        .route("/reports", get(ReportHandler::list))
        .route("/reports/{report}", get(ReportHandler::get))
        .route(
            "/reports/{report}/lock",
            get(ReportHandler::get_lock)
                .post(ReportHandler::lock)
                .delete(ReportHandler::unlock),
        )
}
