use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};

use super::audit_log_dto::{CreateAuditDto, ListAuditQuery};
use super::audit_log_entity::AuditLogEntry;
use super::audit_log_interfaces::IAuditLogUsecase;
use crate::pkg::response::api_json::ApiJson;
use crate::pkg::response::response_error::AppResult;
use crate::pkg::response::response_success::ApiResponse;

pub struct AuditLogHandler;

impl AuditLogHandler {
    pub async fn list(
        Extension(usecase): Extension<Arc<dyn IAuditLogUsecase>>,
        Query(query): Query<ListAuditQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<AuditLogEntry>>>> {
        let (entries, meta) = usecase.list(query).await?;
        Ok(Json(ApiResponse::paginated(
            "Audit logs retrieved successfully",
            entries,
            meta,
        )))
    }

    /// Full chronological lifecycle for one root transaction.
    pub async fn timeline(
        Extension(usecase): Extension<Arc<dyn IAuditLogUsecase>>,
        Path(root_transaction_id): Path<String>,
    ) -> AppResult<Json<ApiResponse<Vec<AuditLogEntry>>>> {
        let entries = usecase.timeline(&root_transaction_id).await?;
        Ok(Json(ApiResponse::success(
            "Audit timeline retrieved successfully",
            entries,
        )))
    }

    pub async fn get_by_id(
        Extension(usecase): Extension<Arc<dyn IAuditLogUsecase>>,
        Path(id): Path<String>,
    ) -> AppResult<Json<ApiResponse<AuditLogEntry>>> {
        let entry = usecase.get_by_id(&id).await?;
        Ok(Json(ApiResponse::success(
            "Audit log retrieved successfully",
            entry,
        )))
    }

    pub async fn create(
        Extension(usecase): Extension<Arc<dyn IAuditLogUsecase>>,
        ApiJson(dto): ApiJson<CreateAuditDto>,
    ) -> AppResult<Json<ApiResponse<AuditLogEntry>>> {
        let entry = usecase.create(dto).await?;
        Ok(Json(ApiResponse::success(
            "Audit log created successfully",
            entry,
        )))
    }
}
