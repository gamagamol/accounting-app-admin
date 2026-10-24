use std::sync::Arc;

use axum::Json;
use axum::extract::rejection::{JsonRejection, QueryRejection};
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;

use crate::app::error::{AppError, AppResult};
use crate::core::audit::entities::{AuditError, AuditLogEntry};
use crate::core::audit::interfaces::AuditUsecase;
use crate::core::audit::usecases::dto::{CreateAuditLogRequest, ListAuditLogsRequest, PageMeta};
use crate::pkg::response::ApiResponse;

use super::ListAuditLogsQuery;

pub struct AuditHandler {
    usecase: Arc<dyn AuditUsecase>,
}

impl AuditHandler {
    pub fn new(usecase: Arc<dyn AuditUsecase>) -> Self {
        Self { usecase }
    }

    /// GET /api/audit-logs
    pub async fn list(
        State(handler): State<Arc<AuditHandler>>,
        query: Result<Query<ListAuditLogsQuery>, QueryRejection>,
    ) -> AppResult<Json<ApiResponse<Vec<AuditLogEntry>>>> {
        let Query(query) = query
            .map_err(|rejection| AppError::from(AuditError::BadRequest(rejection.to_string())))?;

        let result = handler
            .usecase
            .list(ListAuditLogsRequest {
                module: query.module,
                entity_type: query.entity_type,
                entity_id: query.entity_id,
                search: query.search,
                page: query.page.unwrap_or(1),
                limit: query.limit.unwrap_or(50),
            })
            .await?;

        let meta = PageMeta {
            page: result.page,
            limit: result.limit,
            total: result.total,
        };

        Ok(Json(ApiResponse::success_with_meta(
            "Audit logs retrieved successfully",
            result.items,
            serde_json::to_value(meta).unwrap_or(serde_json::Value::Null),
        )))
    }

    /// GET /api/audit-logs/:id
    pub async fn get(
        State(handler): State<Arc<AuditHandler>>,
        Path(id): Path<String>,
    ) -> AppResult<Json<ApiResponse<AuditLogEntry>>> {
        let entry = handler.usecase.get(id).await?;
        Ok(Json(ApiResponse::success(
            "Audit log retrieved successfully",
            entry,
        )))
    }

    /// POST /api/audit-logs
    pub async fn create(
        State(handler): State<Arc<AuditHandler>>,
        payload: Result<Json<CreateAuditLogRequest>, JsonRejection>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<AuditLogEntry>>)> {
        let Json(payload) = payload
            .map_err(|rejection| AppError::from(AuditError::BadRequest(rejection.to_string())))?;

        let entry = handler.usecase.create(payload).await?;

        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Audit log created successfully",
                entry,
            )),
        ))
    }

    /// DELETE /api/audit-logs/:id
    pub async fn delete(
        State(handler): State<Arc<AuditHandler>>,
        Path(id): Path<String>,
    ) -> AppResult<Json<ApiResponse<()>>> {
        handler.usecase.delete(id).await?;
        Ok(Json(ApiResponse::success_without_data(
            "Audit log deleted successfully",
        )))
    }

    /// DELETE /api/audit-logs/entity/:entityType/:entityId
    pub async fn delete_for_entity(
        State(handler): State<Arc<AuditHandler>>,
        Path((entity_type, entity_id)): Path<(String, String)>,
    ) -> AppResult<Json<ApiResponse<serde_json::Value>>> {
        let deleted = handler
            .usecase
            .delete_for_entity(entity_type, entity_id)
            .await?;

        Ok(Json(ApiResponse::success(
            "Audit logs deleted successfully",
            serde_json::json!({ "deleted": deleted }),
        )))
    }
}
