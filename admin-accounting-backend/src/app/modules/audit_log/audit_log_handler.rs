use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};
use axum::http::StatusCode;

use super::audit_log_dto::{CreateAuditDto, DeleteEntityAuditResponse, ListAuditQuery};
use super::audit_log_entity::AuditLogEntry;
use super::audit_log_interfaces::IAuditLogUsecase;
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
        Json(dto): Json<CreateAuditDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<AuditLogEntry>>)> {
        let created = usecase.create(dto).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Audit log created successfully",
                created,
            )),
        ))
    }

    pub async fn delete(
        Extension(usecase): Extension<Arc<dyn IAuditLogUsecase>>,
        Path(id): Path<String>,
    ) -> AppResult<Json<ApiResponse<()>>> {
        usecase.delete(&id).await?;
        Ok(Json(ApiResponse::success(
            "Audit log deleted successfully",
            (),
        )))
    }

    pub async fn delete_for_entity(
        Extension(usecase): Extension<Arc<dyn IAuditLogUsecase>>,
        Path((entity_type, entity_id)): Path<(String, String)>,
    ) -> AppResult<Json<ApiResponse<DeleteEntityAuditResponse>>> {
        let deleted = usecase.delete_for_entity(&entity_type, &entity_id).await?;
        Ok(Json(ApiResponse::success(
            "Audit logs deleted for entity successfully",
            DeleteEntityAuditResponse { deleted },
        )))
    }
}
