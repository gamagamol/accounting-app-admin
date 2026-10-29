use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};
use axum::http::StatusCode;
use serde_json::Value;

use super::journal_dto::{CreateJournalDto, JournalActionDto, JournalListQuery};
use super::journal_interfaces::IJournalUsecase;
use crate::pkg::response::response_error::AppResult;
use crate::pkg::response::response_success::ApiResponse;

pub struct JournalHandler;

impl JournalHandler {
    pub async fn list(
        Extension(usecase): Extension<Arc<dyn IJournalUsecase>>,
        Query(query): Query<JournalListQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<Value>>>> {
        let (items, meta) = usecase.list(query).await?;
        Ok(Json(ApiResponse::paginated(
            "Manual journals retrieved successfully",
            items,
            meta,
        )))
    }

    pub async fn get(
        Extension(usecase): Extension<Arc<dyn IJournalUsecase>>,
        Path(id): Path<i64>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let journal = usecase.get(id).await?;
        Ok(Json(ApiResponse::success(
            "Manual journal retrieved successfully",
            journal,
        )))
    }

    pub async fn create(
        Extension(usecase): Extension<Arc<dyn IJournalUsecase>>,
        Json(dto): Json<CreateJournalDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<Value>>)> {
        let journal = usecase.create(dto).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Manual journal created successfully",
                journal,
            )),
        ))
    }

    pub async fn update(
        Extension(usecase): Extension<Arc<dyn IJournalUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<CreateJournalDto>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let journal = usecase.update(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Manual journal updated successfully",
            journal,
        )))
    }

    pub async fn delete(
        Extension(usecase): Extension<Arc<dyn IJournalUsecase>>,
        Path(id): Path<i64>,
        Query(action): Query<JournalActionDto>,
    ) -> AppResult<Json<ApiResponse<()>>> {
        usecase.delete(id, action.actor).await?;
        Ok(Json(ApiResponse::success(
            "Manual journal deleted successfully",
            (),
        )))
    }

    pub async fn post(
        Extension(usecase): Extension<Arc<dyn IJournalUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<JournalActionDto>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let journal = usecase.post(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Manual journal posted successfully",
            journal,
        )))
    }

    pub async fn unpost(
        Extension(usecase): Extension<Arc<dyn IJournalUsecase>>,
        Path(id): Path<i64>,
        Json(dto): Json<JournalActionDto>,
    ) -> AppResult<Json<ApiResponse<Value>>> {
        let journal = usecase.unpost(id, dto).await?;
        Ok(Json(ApiResponse::success(
            "Manual journal unposted successfully",
            journal,
        )))
    }
}
