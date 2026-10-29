use async_trait::async_trait;

use super::product_category_dto::{
    ListProductCategoriesQuery, ProductCategoryData, ProductCategoryResponse,
};
use super::product_category_entity::{ProductCategory, ProductCategoryFilter};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

#[async_trait]
pub trait IProductCategoryRepo: Send + Sync {
    async fn find_all(
        &self,
        filter: ProductCategoryFilter,
    ) -> Result<(Vec<ProductCategory>, u64), String>;
    async fn find_by_id(&self, id: i64) -> Result<Option<ProductCategory>, String>;
    async fn find_by_code(&self, code: &str) -> Result<Option<ProductCategory>, String>;
    async fn create(&self, data: &ProductCategoryData) -> Result<ProductCategory, String>;
    async fn update(&self, id: i64, data: &ProductCategoryData) -> Result<ProductCategory, String>;
    async fn delete(&self, id: i64) -> Result<bool, String>;
}

#[async_trait]
pub trait IProductCategoryUsecase: Send + Sync {
    async fn list(
        &self,
        query: ListProductCategoriesQuery,
    ) -> Result<(Vec<ProductCategoryResponse>, PaginationMeta), AppError>;
    async fn get_by_id(&self, id: i64) -> Result<ProductCategoryResponse, AppError>;
    async fn create(&self, data: ProductCategoryData) -> Result<ProductCategoryResponse, AppError>;
    async fn update(
        &self,
        id: i64,
        data: ProductCategoryData,
    ) -> Result<ProductCategoryResponse, AppError>;
    async fn delete(&self, id: i64) -> Result<(), AppError>;
}
