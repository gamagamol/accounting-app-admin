use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path};
use serde_json::Value;

use super::master_data_crud_interface::{IMasterDataCrudUsecase, MasterDataEntity};
use crate::pkg::response::response_error::{AppError, AppResult};
use crate::pkg::response::response_success::ApiResponse;

pub struct MasterDataCrudHandler;

impl MasterDataCrudHandler {
    pub async fn list(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Path(entity): Path<String>,
    ) -> AppResult<Json<ApiResponse<Vec<Value>>>> {
        let entity = parse_entity(&entity)?;
        Self::list_entity(usecase, entity).await
    }

    pub async fn get(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Path((entity, id)): Path<(String, i64)>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let entity = parse_entity(&entity)?;
        let item = usecase.get(entity, id).await?;
        Ok(Json(ApiResponse::success(
            format!("{} retrieved successfully", entity.display_name()),
            item,
        )))
    }

    pub async fn create(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Path(entity): Path<String>,
        Json(payload): Json<Value>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let entity = parse_entity(&entity)?;
        let item = usecase.create(entity, payload).await?;
        Ok(Json(ApiResponse::success(
            format!("{} created successfully", entity.display_name()),
            item,
        )))
    }

    pub async fn update(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Path((entity, id)): Path<(String, i64)>,
        Json(payload): Json<Value>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let entity = parse_entity(&entity)?;
        let item = usecase.update(entity, id, payload).await?;
        Ok(Json(ApiResponse::success(
            format!("{} updated successfully", entity.display_name()),
            item,
        )))
    }

    pub async fn delete(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Path((entity, id)): Path<(String, i64)>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let entity = parse_entity(&entity)?;
        usecase.delete(entity, id).await?;
        Ok(Json(ApiResponse::success(
            format!("{} deleted successfully", entity.display_name()),
            serde_json::json!({ "id": id }),
        )))
    }

    // Backwards-compatible aliases for the original frontend department API.
    pub async fn list_departments(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
    ) -> AppResult<Json<ApiResponse<Vec<Value>>>> {
        Self::list_entity(usecase, MasterDataEntity::Departments).await
    }

    pub async fn get_department(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let item = usecase.get(MasterDataEntity::Departments, id).await?;
        Ok(Json(ApiResponse::success(
            "department retrieved successfully",
            item,
        )))
    }

    pub async fn create_department(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Json(payload): Json<Value>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let item = usecase
            .create(MasterDataEntity::Departments, payload)
            .await?;
        Ok(Json(ApiResponse::success(
            "department created successfully",
            item,
        )))
    }

    pub async fn update_department(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Path(id): Path<i64>,
        Json(payload): Json<Value>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let item = usecase
            .update(MasterDataEntity::Departments, id, payload)
            .await?;
        Ok(Json(ApiResponse::success(
            "department updated successfully",
            item,
        )))
    }

    pub async fn delete_department(
        Extension(usecase): Extension<Arc<dyn IMasterDataCrudUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        usecase.delete(MasterDataEntity::Departments, id).await?;
        Ok(Json(ApiResponse::success(
            "department deleted successfully",
            serde_json::json!({ "id": id }),
        )))
    }

    async fn list_entity(
        usecase: Arc<dyn IMasterDataCrudUsecase>,
        entity: MasterDataEntity,
    ) -> AppResult<Json<ApiResponse<Vec<Value>>>> {
        let items = usecase.list(entity).await?;
        Ok(Json(ApiResponse::success(
            format!("{} records retrieved successfully", entity.display_name()),
            items,
        )))
    }
}

fn parse_entity(value: &str) -> Result<MasterDataEntity, AppError> {
    MasterDataEntity::parse(value)
        .ok_or_else(|| AppError::NotFound(format!("Unknown master data entity: {value}")))
}
