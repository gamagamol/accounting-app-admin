use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

use crate::core::audit::entities::AuditError;
use crate::core::pending::entities::PendingError;
use crate::core::user::entities::UserError;
use crate::pkg::response::ApiResponse;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug)]
pub enum AppError {
    User(UserError),
    Audit(AuditError),
    Pending(PendingError),
}

impl From<UserError> for AppError {
    fn from(error: UserError) -> Self {
        Self::User(error)
    }
}

impl From<AuditError> for AppError {
    fn from(error: AuditError) -> Self {
        Self::Audit(error)
    }
}

impl From<PendingError> for AppError {
    fn from(error: PendingError) -> Self {
        Self::Pending(error)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message, errors) = match self {
            AppError::User(error) => match error {
                UserError::NotFound => (StatusCode::NOT_FOUND, "User not found".to_string(), None),
                UserError::EmailExists => (
                    StatusCode::CONFLICT,
                    "Email is already registered".to_string(),
                    None,
                ),
                UserError::InvalidRole => (
                    StatusCode::BAD_REQUEST,
                    "Invalid user role".to_string(),
                    None,
                ),
                UserError::Validation(errors) => (
                    StatusCode::BAD_REQUEST,
                    "Validation failed".to_string(),
                    Some(serde_json::to_value(errors).unwrap_or(serde_json::Value::Null)),
                ),
                UserError::BadRequest(message) => (StatusCode::BAD_REQUEST, message, None),
                UserError::Database(error) => {
                    tracing::error!(error = %error, "database error");
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal server error".to_string(),
                        None,
                    )
                }
            },
            AppError::Audit(error) => match error {
                AuditError::NotFound => (
                    StatusCode::NOT_FOUND,
                    "Audit log not found".to_string(),
                    None,
                ),
                AuditError::Validation(errors) => (
                    StatusCode::BAD_REQUEST,
                    "Validation failed".to_string(),
                    Some(serde_json::to_value(errors).unwrap_or(serde_json::Value::Null)),
                ),
                AuditError::BadRequest(message) => (StatusCode::BAD_REQUEST, message, None),
                AuditError::Database(error) => {
                    tracing::error!(error = %error, "audit database error");
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal server error".to_string(),
                        None,
                    )
                }
            },
            AppError::Pending(error) => match error {
                PendingError::NotFound => (
                    StatusCode::NOT_FOUND,
                    "Pending request not found".to_string(),
                    None,
                ),
                PendingError::Validation(errors) => (
                    StatusCode::BAD_REQUEST,
                    "Validation failed".to_string(),
                    Some(serde_json::to_value(errors).unwrap_or(serde_json::Value::Null)),
                ),
                PendingError::BadRequest(message) => (StatusCode::BAD_REQUEST, message, None),
                PendingError::Conflict(message) => (StatusCode::CONFLICT, message, None),
                PendingError::Forbidden(message) => (StatusCode::FORBIDDEN, message, None),
                PendingError::Database(error) => {
                    tracing::error!(error = %error, "pending database error");
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal server error".to_string(),
                        None,
                    )
                }
            },
        };

        (status, Json(ApiResponse::<()>::error(message, errors))).into_response()
    }
}
