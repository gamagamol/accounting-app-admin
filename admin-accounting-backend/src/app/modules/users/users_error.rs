use thiserror::Error;

use crate::pkg::response::response_error::AppError;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("User not found")]
    NotFound,

    #[error("Email is already registered")]
    EmailExists,

    #[error("Repository error: {0}")]
    Repository(String),
}

impl From<UserError> for AppError {
    fn from(err: UserError) -> Self {
        match err {
            UserError::NotFound => AppError::NotFound("User not found".to_string()),
            UserError::EmailExists => AppError::Conflict("Email is already registered".to_string()),
            UserError::Repository(msg) => AppError::Database(msg),
        }
    }
}
