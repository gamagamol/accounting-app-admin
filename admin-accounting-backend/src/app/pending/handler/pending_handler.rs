use std::sync::Arc;

use axum::Json;
use axum::extract::rejection::{JsonRejection, QueryRejection};
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;

use crate::app::error::{AppError, AppResult};
use crate::core::pending::entities::{PendingError, PendingRequest};
use crate::core::pending::interfaces::PendingUsecase;
use crate::core::pending::usecases::dto::{
    CreatePendingRequest, ListPendingRequest, PendingDecisionRequest, PendingPageMeta,
};
use crate::pkg::response::ApiResponse;

use super::ListPendingQuery;

pub struct PendingHandler {
    usecase: Arc<dyn PendingUsecase>,
}

impl PendingHandler {
    pub fn new(usecase: Arc<dyn PendingUsecase>) -> Self {
        Self { usecase }
    }

    /// GET /api/pending?transactionType=quotation&transactionId=...
    pub async fn list(
        State(handler): State<Arc<PendingHandler>>,
        query: Result<Query<ListPendingQuery>, QueryRejection>,
    ) -> AppResult<Json<ApiResponse<Vec<PendingRequest>>>> {
        let Query(query) = query
            .map_err(|rejection| AppError::from(PendingError::BadRequest(rejection.to_string())))?;

        let result = handler
            .usecase
            .list(ListPendingRequest {
                transaction_type: query.transaction_type,
                transaction_id: query.transaction_id,
                status: query.status,
                page: query.page.unwrap_or(1),
                limit: query.limit.unwrap_or(50),
            })
            .await?;

        let meta = PendingPageMeta {
            page: result.page,
            limit: result.limit,
            total: result.total,
        };

        Ok(Json(ApiResponse::success_with_meta(
            "Pending requests retrieved successfully",
            result.items,
            serde_json::to_value(meta).unwrap_or(serde_json::Value::Null),
        )))
    }

    /// GET /api/pending/:transactionType/:id
    pub async fn get(
        State(handler): State<Arc<PendingHandler>>,
        Path((transaction_type, id)): Path<(String, String)>,
    ) -> AppResult<Json<ApiResponse<PendingRequest>>> {
        let request = handler.usecase.get(transaction_type, id).await?;
        Ok(Json(ApiResponse::success(
            "Pending request retrieved successfully",
            request,
        )))
    }

    /// POST /api/pending
    pub async fn create(
        State(handler): State<Arc<PendingHandler>>,
        payload: Result<Json<CreatePendingRequest>, JsonRejection>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<PendingRequest>>)> {
        let Json(payload) = payload
            .map_err(|rejection| AppError::from(PendingError::BadRequest(rejection.to_string())))?;

        let request = handler.usecase.create(payload).await?;

        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                "Pending request created successfully",
                request,
            )),
        ))
    }

    /// POST /api/pending/:transactionType/:id/approve
    pub async fn approve(
        State(handler): State<Arc<PendingHandler>>,
        Path((transaction_type, id)): Path<(String, String)>,
        payload: Result<Json<PendingDecisionRequest>, JsonRejection>,
    ) -> AppResult<Json<ApiResponse<PendingRequest>>> {
        let Json(payload) = payload
            .map_err(|rejection| AppError::from(PendingError::BadRequest(rejection.to_string())))?;

        let request = handler
            .usecase
            .approve(transaction_type, id, payload)
            .await?;

        Ok(Json(ApiResponse::success(
            "Pending request approved successfully",
            request,
        )))
    }

    /// POST /api/pending/:transactionType/:id/reject
    pub async fn reject(
        State(handler): State<Arc<PendingHandler>>,
        Path((transaction_type, id)): Path<(String, String)>,
        payload: Result<Json<PendingDecisionRequest>, JsonRejection>,
    ) -> AppResult<Json<ApiResponse<PendingRequest>>> {
        let Json(payload) = payload
            .map_err(|rejection| AppError::from(PendingError::BadRequest(rejection.to_string())))?;

        let request = handler
            .usecase
            .reject(transaction_type, id, payload)
            .await?;

        Ok(Json(ApiResponse::success(
            "Pending request rejected successfully",
            request,
        )))
    }
}
