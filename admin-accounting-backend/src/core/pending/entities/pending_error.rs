use std::collections::BTreeMap;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum PendingError {
    #[error("pending request not found")]
    NotFound,

    #[error("validation failed")]
    Validation(BTreeMap<String, String>),

    #[error("bad request: {0}")]
    BadRequest(String),

    #[error("conflict: {0}")]
    Conflict(String),

    #[error("forbidden: {0}")]
    Forbidden(String),

    #[error("database error: {0}")]
    Database(String),
}
