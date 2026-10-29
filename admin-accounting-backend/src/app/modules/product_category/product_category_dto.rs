use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::product_category_entity::ProductCategory;

#[derive(Debug, Deserialize)]
pub struct CreateProductCategoryDto {
    pub code: String,
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductCategoryDto {
    pub code: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListProductCategoriesQuery {
    pub search: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Clone)]
pub struct ProductCategoryData {
    pub code: String,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProductCategoryResponse {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

impl From<ProductCategory> for ProductCategoryResponse {
    fn from(model: ProductCategory) -> Self {
        Self {
            id: model.id,
            code: model.code,
            name: model.name,
            description: model.description,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
