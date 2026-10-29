use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};
use axum::http::StatusCode;

use super::product_category_dto::{
    CreateProductCategoryDto, ListProductCategoriesQuery, ProductCategoryData,
    ProductCategoryResponse, UpdateProductCategoryDto,
};
use super::product_category_interface::IProductCategoryUsecase;
use crate::pkg::response::response_error::{AppError, AppResult};
use crate::pkg::response::response_success::ApiResponse;

pub struct ProductCategoryHandler;

impl ProductCategoryHandler {
    pub async fn list(
        Extension(usecase): Extension<Arc<dyn IProductCategoryUsecase>>,
        Query(query): Query<ListProductCategoriesQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<ProductCategoryResponse>>>> {
        let (items, meta) = usecase.list(query).await?;
        Ok(Json(ApiResponse::paginated(
            "Product categories retrieved successfully",
            items,
            meta,
        )))
    }

    pub async fn get_by_id(
        Extension(usecase): Extension<Arc<dyn IProductCategoryUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<ProductCategoryResponse>>> {
        let item = usecase.get_by_id(id).await?;
        Ok(Json(ApiResponse::success(
            "Product category retrieved successfully",
            item,
        )))
    }

    pub async fn create(
        Extension(usecase): Extension<Arc<dyn IProductCategoryUsecase>>,
        Json(dto): Json<CreateProductCategoryDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<ProductCategoryResponse>>)> {
        let data = ProductCategoryData {
            code: validate_code(&dto.code)?,
            name: validate_name(&dto.name)?,
            description: normalize_description(dto.description),
        };

        let created = usecase.create(data).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Product category created successfully",
                created,
            )),
        ))
    }

    pub async fn update(
        Extension(usecase): Extension<Arc<dyn IProductCategoryUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<UpdateProductCategoryDto>,
    ) -> AppResult<Json<ApiResponse<ProductCategoryResponse>>> {
        let existing = usecase.get_by_id(id).await?;

        let data = ProductCategoryData {
            code: dto
                .code
                .as_deref()
                .map(validate_code)
                .transpose()?
                .unwrap_or(existing.code),
            name: dto
                .name
                .as_deref()
                .map(validate_name)
                .transpose()?
                .unwrap_or(existing.name),
            description: dto.description.map(Some).unwrap_or(existing.description),
        };

        let updated = usecase.update(id, data).await?;
        Ok(Json(ApiResponse::success(
            "Product category updated successfully",
            updated,
        )))
    }

    pub async fn delete(
        Extension(usecase): Extension<Arc<dyn IProductCategoryUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<()>>> {
        usecase.delete(id).await?;
        Ok(Json(ApiResponse::success(
            "Product category deleted successfully",
            (),
        )))
    }
}

fn validate_code(code: &str) -> Result<String, AppError> {
    let code = code.trim().to_uppercase();

    if code.is_empty() {
        return Err(AppError::BadRequest("Code is required".to_string()));
    }

    if code.chars().count() > 30 {
        return Err(AppError::BadRequest(
            "Code must be at most 30 characters".to_string(),
        ));
    }

    Ok(code)
}

fn validate_name(name: &str) -> Result<String, AppError> {
    let name = name.trim();

    if name.is_empty() {
        return Err(AppError::BadRequest("Name is required".to_string()));
    }

    if name.chars().count() > 100 {
        return Err(AppError::BadRequest(
            "Name must be at most 100 characters".to_string(),
        ));
    }

    Ok(name.to_string())
}

fn normalize_description(description: Option<String>) -> Option<String> {
    description.and_then(|value| {
        let value = value.trim().to_string();
        if value.is_empty() { None } else { Some(value) }
    })
}
