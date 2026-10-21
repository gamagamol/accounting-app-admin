use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

use crate::core::user::entities::UserError;
use crate::pkg::response::ApiResponse;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug)]
pub struct AppError(pub UserError);

impl From<UserError> for AppError {
    fn from(error: UserError) -> Self {
        Self(error)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message, errors) = match self.0 {
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
        };

        (status, Json(ApiResponse::<()>::error(message, errors))).into_response()
    }
}
