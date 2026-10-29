use std::sync::Arc;

use axum::Json;
use axum::extract::{Extension, Path, Query};
use axum::http::StatusCode;

use super::transactions_dto::{
    ApproveTransactionDto, CreateTransactionDto, DocumentType, ListTransactionsQuery,
    TransactionResponse,
};
use super::transactions_interfaces::ITransactionUsecase;
use crate::pkg::response::response_error::{AppError, AppResult};
use crate::pkg::response::response_success::ApiResponse;

pub struct TransactionHandler;

impl TransactionHandler {
    pub async fn list(
        Extension(usecase): Extension<Arc<dyn ITransactionUsecase>>,
        Path(document_type): Path<DocumentType>,
        Query(query): Query<ListTransactionsQuery>,
    ) -> AppResult<Json<ApiResponse<Vec<serde_json::Value>>>> {
        let (items, meta) = usecase.list(document_type, query).await?;
        Ok(Json(ApiResponse::paginated(
            format!("{} list retrieved successfully", document_type.as_str()),
            items,
            meta,
        )))
    }

    pub async fn get(
        Extension(usecase): Extension<Arc<dyn ITransactionUsecase>>,
        Path((document_type, id)): Path<(DocumentType, i64)>,
    ) -> AppResult<Json<ApiResponse<TransactionResponse>>> {
        let item = usecase.get(document_type, id).await?;
        Ok(Json(ApiResponse::success(
            format!("{} retrieved successfully", document_type.as_str()),
            item,
        )))
    }

    pub async fn create(
        Extension(usecase): Extension<Arc<dyn ITransactionUsecase>>,
        Path(document_type): Path<DocumentType>,
        Json(dto): Json<CreateTransactionDto>,
    ) -> AppResult<(StatusCode, Json<ApiResponse<TransactionResponse>>)> {
        let created = usecase.create(document_type, dto).await?;
        Ok((
            StatusCode::CREATED,
            Json(ApiResponse::success(
                format!("{} created successfully", document_type.as_str()),
                created,
            )),
        ))
    }

    pub async fn approve(
        Extension(usecase): Extension<Arc<dyn ITransactionUsecase>>,
        Path((document_type, id)): Path<(DocumentType, i64)>,
        Json(dto): Json<ApproveTransactionDto>,
    ) -> AppResult<Json<ApiResponse<TransactionResponse>>> {
        if !document_type.is_approvable() {
            return Err(AppError::BadRequest(format!(
                "{} does not support approval",
                document_type.as_str()
            )));
        }
        let approved = usecase.approve(document_type, id, dto).await?;
        Ok(Json(ApiResponse::success(
            format!("{} approved successfully", document_type.as_str()),
            approved,
        )))
    }
}
