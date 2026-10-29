use axum::Router;
use axum::routing::get;

use crate::app::modules::master_data::{MasterDataCrudHandler, MasterDataHandler};
use crate::app::modules::product_category::ProductCategoryHandler;
use crate::app::modules::users::UserHandler;

/// Semua route master data.
pub fn routes() -> Router {
    Router::new()
        .route("/master-data/options", get(MasterDataHandler::options))
        .route(
            "/master-data/{entity}",
            get(MasterDataCrudHandler::list).post(MasterDataCrudHandler::create),
        )
        .route(
            "/master-data/{entity}/{id}",
            get(MasterDataCrudHandler::get)
                .put(MasterDataCrudHandler::update)
                .delete(MasterDataCrudHandler::delete),
        )
        // Compatibility route used by the original department screen.
        .route(
            "/master/departments",
            get(MasterDataCrudHandler::list_departments)
                .post(MasterDataCrudHandler::create_department),
        )
        .route(
            "/master/departments/{id}",
            get(MasterDataCrudHandler::get_department)
                .put(MasterDataCrudHandler::update_department)
                .delete(MasterDataCrudHandler::delete_department),
        )
        .route("/users", get(UserHandler::list).post(UserHandler::create))
        .route(
            "/users/{id}",
            get(UserHandler::get_by_id)
                .put(UserHandler::update)
                .delete(UserHandler::delete),
        )
        .route(
            "/product-categories",
            get(ProductCategoryHandler::list).post(ProductCategoryHandler::create),
        )
        .route(
            "/product-categories/{id}",
            get(ProductCategoryHandler::get_by_id)
                .put(ProductCategoryHandler::update)
                .delete(ProductCategoryHandler::delete),
        )
}
