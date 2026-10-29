use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};
use serde_json::Value;

use super::reports_dto::{CreateReportLockDto, ReportLockQuery, ReportQuery};
use super::reports_interfaces::IReportUsecase;
use crate::pkg::response::response_error::AppResult;
use crate::pkg::response::response_success::ApiResponse;

pub struct ReportHandler;

impl ReportHandler {
    pub async fn list(
        Extension(usecase): Extension<Arc<dyn IReportUsecase>>,
    ) -> Json<ApiResponse<Vec<&'static str>>> {
        Json(ApiResponse::success(
            "Available reports retrieved successfully",
            usecase.available().to_vec(),
        ))
    }

    pub async fn get(
        Extension(usecase): Extension<Arc<dyn IReportUsecase>>,
        Path(report): Path<String>,
        Query(query): Query<ReportQuery>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let rows = usecase.get(&report, query.period.as_deref()).await?;
        Ok(Json(ApiResponse::success(
            format!("Report '{report}' retrieved successfully"),
            rows,
        )))
    }

    pub async fn get_lock(
        Extension(usecase): Extension<Arc<dyn IReportUsecase>>,
        Path(report): Path<String>,
        Query(query): Query<ReportLockQuery>,
    ) -> AppResult<Json<ApiResponse<Option<Value>>>> {
        let lock = usecase.get_lock(&report, &query.period).await?;
        Ok(Json(ApiResponse::success(
            format!("Report lock for '{report}' retrieved successfully"),
            lock,
        )))
    }

    pub async fn lock(
        Extension(usecase): Extension<Arc<dyn IReportUsecase>>,
        Path(report): Path<String>,
        Json(dto): Json<CreateReportLockDto>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let lock = usecase.lock(&report, dto).await?;
        Ok(Json(ApiResponse::success(
            format!("Report '{report}' locked successfully"),
            lock,
        )))
    }

    pub async fn unlock(
        Extension(usecase): Extension<Arc<dyn IReportUsecase>>,
        Path(report): Path<String>,
        Query(query): Query<ReportLockQuery>,
    ) -> AppResult<Json<ApiResponse<()>>> {
        usecase.unlock(&report, &query.period).await?;
        Ok(Json(ApiResponse::success(
            format!("Report '{report}' unlocked successfully"),
            (),
        )))
    }
}
