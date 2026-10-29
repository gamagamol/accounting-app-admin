use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};
use axum::http::StatusCode;
use serde_json::Value;

use super::period_dto::{CreatePeriodDto, ListPeriodsQuery, PeriodActionDto, UpdatePeriodDto};
use super::period_interfaces::IPeriodUsecase;
use crate::pkg::response::response_error::AppResult;
use crate::pkg::response::response_success::ApiResponse;

pub struct PeriodHandler;

impl PeriodHandler {
    pub async fn list(
        Extension(usecase): Extension<Arc<dyn IPeriodUsecase>>,
        Query(query): Query<ListPeriodsQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<Value>>>> {
        let items = usecase.list(query).await?;
        Ok(Json(ApiResponse::success(
            "Accounting periods retrieved successfully",
            items,
        )))
    }

    pub async fn get(
        Extension(usecase): Extension<Arc<dyn IPeriodUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let item = usecase.get(id).await?;
        Ok(Json(ApiResponse::success(
            "Accounting period retrieved successfully",
            item,
        )))
    }

    pub async fn create(
        Extension(usecase): Extension<Arc<dyn IPeriodUsecase>>,
        Json(dto): Json<CreatePeriodDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<Value>>)> {
        let item = usecase.create(dto).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Accounting period created successfully",
                item,
            )),
        ))
    }

    pub async fn update(
        Extension(usecase): Extension<Arc<dyn IPeriodUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<UpdatePeriodDto>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let item = usecase.update(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Accounting period updated successfully",
            item,
        )))
    }

    pub async fn delete(
        Extension(usecase): Extension<Arc<dyn IPeriodUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<()>>> {
        usecase.delete(id).await?;
        Ok(Json(ApiResponse::success(
            "Accounting period deleted successfully",
            (),
        )))
    }

    pub async fn close(
        Extension(usecase): Extension<Arc<dyn IPeriodUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<PeriodActionDto>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let item = usecase.close(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Accounting period closed successfully",
            item,
        )))
    }

    pub async fn reopen(
        Extension(usecase): Extension<Arc<dyn IPeriodUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<PeriodActionDto>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let item = usecase.reopen(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Accounting period reopened successfully",
            item,
        )))
    }
}
