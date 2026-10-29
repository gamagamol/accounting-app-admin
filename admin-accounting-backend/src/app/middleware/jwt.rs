use std::sync::Arc;

use axum::extract::{Request, State};
use axum::http::header::AUTHORIZATION;
use axum::middleware::Next;
use axum::response::Response;

use crate::infra::Config;
use crate::pkg::response::response_error::AppError;

/// Middleware JWT sederhana:
/// - Jika `JWT_SECRET` kosong, middleware dilewati (mode development/test).
/// - Jika diisi, request wajib membawa header `Authorization: Bearer <token>`.
pub async fn jwt_middleware(
    State(config): State<Arc<Config>>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    if config.jwt_secret.is_empty() {
        return Ok(next.run(request).await);
    }

    let token = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .ok_or_else(|| AppError::Unauthorized("Missing bearer token".to_string()))?;

    let validation = jsonwebtoken::Validation::default();
    jsonwebtoken::decode::<serde_json::Value>(
        token,
        &jsonwebtoken::DecodingKey::from_secret(config.jwt_secret.as_bytes()),
        &validation,
    )
    .map_err(|err| AppError::Unauthorized(format!("Invalid token: {err}")))?;

    Ok(next.run(request).await)
}
