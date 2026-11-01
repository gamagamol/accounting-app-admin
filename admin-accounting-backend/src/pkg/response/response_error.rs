use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::{Map, Value};
use thiserror::Error;

use super::response_success::ApiResponse;

pub type AppResult<T> = Result<T, AppError>;

/// Convert a raw sqlx error into an actionable API error.
///
/// Database constraint failures must not surface as an opaque 500. The caller
/// (and the frontend form) needs to know which field/reference is invalid.
pub fn db_error(error: sqlx::Error) -> AppError {
    let Some(db) = error.as_database_error() else {
        return AppError::Database(error.to_string());
    };

    let code = db.code().unwrap_or_default();
    let constraint = db.constraint().unwrap_or_default();
    let detail = db.message();
    let table = db.table().unwrap_or_default();

    match code.as_ref() {
        "23505" => AppError::Conflict(format!(
            "Duplicate value{}. {}",
            if table.is_empty() {
                String::new()
            } else {
                format!(" on table {table}")
            },
            friendly_constraint(constraint)
        )),
        "23503" => AppError::BadRequest(format!(
            "Invalid reference{}. {}",
            if table.is_empty() {
                String::new()
            } else {
                format!(" on table {table}")
            },
            friendly_constraint(constraint)
        )),
        "23502" => AppError::BadRequest(format!(
            "Required value is missing{}. {}",
            if table.is_empty() {
                String::new()
            } else {
                format!(" on table {table}")
            },
            friendly_constraint(constraint)
        )),
        "23514" => AppError::BadRequest(format!(
            "Value violates a business rule{}. {}",
            if table.is_empty() {
                String::new()
            } else {
                format!(" on table {table}")
            },
            friendly_constraint(constraint)
        )),
        "22P02" | "22003" | "22007" | "22008" => AppError::BadRequest(format!(
            "Invalid value supplied: {}",
            if detail.is_empty() {
                error.to_string()
            } else {
                detail.to_string()
            }
        )),
        "40001" | "40P01" => AppError::Conflict(
            "The record is being modified by another process. Please retry.".to_string(),
        ),
        _ => AppError::Database(error.to_string()),
    }
}

fn friendly_constraint(constraint: &str) -> String {
    if constraint.is_empty() {
        return "Please check the submitted values.".to_string();
    }

    let field = constraint
        .trim_end_matches("_key")
        .trim_end_matches("_fkey")
        .trim_end_matches("_check")
        .replace('_', " ");

    if constraint.ends_with("_fkey") {
        format!("The selected reference for `{field}` does not exist.")
    } else if constraint.ends_with("_key") {
        format!("`{field}` must be unique and the submitted value already exists.")
    } else {
        format!("Constraint `{constraint}` rejected the submitted value.")
    }
}

/// Build a validation error body from a field name and a message.
pub fn validation_error(field: impl Into<String>, message: impl Into<String>) -> AppError {
    let mut errors = Map::new();
    errors.insert(field.into(), Value::String(message.into()));
    AppError::Validation(Value::Object(errors))
}

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Validation failed")]
    Validation(Value),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("Cache error: {0}")]
    Cache(String),

    #[error("Internal server error")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message, errors) = match &self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone(), None),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, msg.clone(), None),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone(), None),
            AppError::Validation(errs) => (
                StatusCode::BAD_REQUEST,
                "Validation failed".to_string(),
                Some(errs.clone()),
            ),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.clone(), None),
            AppError::Forbidden(msg) => (StatusCode::FORBIDDEN, msg.clone(), None),
            AppError::Database(err) => {
                tracing::error!(error = %err, "database error occurred");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal database error".to_string(),
                    None,
                )
            }
            AppError::Cache(err) => {
                tracing::warn!(error = %err, "cache error occurred");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Cache operation failed".to_string(),
                    None,
                )
            }
            AppError::Internal(err) => {
                tracing::error!(error = %err, "internal server error");
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
