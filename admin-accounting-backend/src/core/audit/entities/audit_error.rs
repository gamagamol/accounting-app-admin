use std::collections::BTreeMap;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuditError {
    #[error("audit log not found")]
    NotFound,

    #[error("validation failed")]
    Validation(BTreeMap<String, String>),

    #[error("bad request: {0}")]
    BadRequest(String),

    #[error("database error: {0}")]
    Database(String),
}
