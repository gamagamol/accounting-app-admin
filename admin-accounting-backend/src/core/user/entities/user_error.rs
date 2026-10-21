use std::collections::BTreeMap;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("user not found")]
    NotFound,

    #[error("email is already registered")]
    EmailExists,

    #[error("invalid user role")]
    InvalidRole,

    #[error("validation failed")]
    Validation(BTreeMap<String, String>),

    #[error("bad request: {0}")]
    BadRequest(String),

    #[error("database error: {0}")]
    Database(String),
}
