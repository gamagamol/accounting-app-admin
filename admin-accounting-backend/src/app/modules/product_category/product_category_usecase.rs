use std::sync::Arc;

use async_trait::async_trait;

use super::product_category_dto::{
    ListProductCategoriesQuery, ProductCategoryData, ProductCategoryResponse,
};
use super::product_category_entity::ProductCategoryFilter;
use super::product_category_interface::{IProductCategoryRepo, IProductCategoryUsecase};
use crate::pkg::constans::constants::{DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

pub struct ProductCategoryUsecase {
    repo: Arc<dyn IProductCategoryRepo>,
}

impl ProductCategoryUsecase {
    pub fn new(repo: Arc<dyn IProductCategoryRepo>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl IProductCategoryUsecase for ProductCategoryUsecase {
    async fn list(
        &self,
        query: ListProductCategoriesQuery,
    ) -> Result<(Vec<ProductCategoryResponse>, PaginationMeta), AppError> {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);

        let filter = ProductCategoryFilter {
            search: query.search,
            page,
            limit,
        };

        let (items, total) = self
            .repo
            .find_all(filter)
            .await
            .map_err(AppError::Database)?;

        let meta = PaginationMeta::new(page, limit, total);
        let responses = items
            .into_iter()
            .map(ProductCategoryResponse::from)
            .collect();

        Ok((responses, meta))
    }

    async fn get_by_id(&self, id: i64) -> Result<ProductCategoryResponse, AppError> {
        self.repo
            .find_by_id(id)
            .await
            .map_err(AppError::Database)?
            .map(ProductCategoryResponse::from)
            .ok_or_else(|| AppError::NotFound("Product category not found".to_string()))
    }

    async fn create(&self, data: ProductCategoryData) -> Result<ProductCategoryResponse, AppError> {
        if self
            .repo
            .find_by_code(&data.code)
            .await
            .map_err(AppError::Database)?
            .is_some()
        {
            return Err(AppError::Conflict(
                "Product category code is already registered".to_string(),
            ));
        }

        let created = self.repo.create(&data).await.map_err(AppError::Database)?;

        Ok(ProductCategoryResponse::from(created))
    }

    async fn update(
        &self,
        id: i64,
        data: ProductCategoryData,
    ) -> Result<ProductCategoryResponse, AppError> {
        let existing = self
            .repo
            .find_by_id(id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Product category not found".to_string()))?;

        if existing.code != data.code
            && self
                .repo
                .find_by_code(&data.code)
                .await
                .map_err(AppError::Database)?
                .is_some()
        {
            return Err(AppError::Conflict(
                "Product category code is already registered".to_string(),
            ));
        }

        let updated = self
            .repo
            .update(id, &data)
            .await
            .map_err(AppError::Database)?;

        Ok(ProductCategoryResponse::from(updated))
    }

    async fn delete(&self, id: i64) -> Result<(), AppError> {
        let deleted = self.repo.delete(id).await.map_err(AppError::Database)?;

        if !deleted {
            return Err(AppError::NotFound("Product category not found".to_string()));
        }

        Ok(())
    }
}
