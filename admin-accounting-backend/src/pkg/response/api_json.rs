use axum::Json;
use axum::extract::{FromRequest, Request};
use axum::http::StatusCode;
use serde::de::DeserializeOwned;

use crate::pkg::response::response_error::{AppError, validation_error};

/// JSON extractor that turns deserialization failures into the standard
/// `ApiResponse` error envelope with the offending field in `errors`.
///
/// Axum's default `Json` rejection returns a plain-text 422, which the
/// frontend cannot display next to a form field.
pub struct ApiJson<T>(pub T);

impl<T, S> FromRequest<S> for ApiJson<T>
where
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Json(value) = Json::<serde_json::Value>::from_request(req, state)
            .await
            .map_err(|rejection| match rejection.status() {
                StatusCode::UNSUPPORTED_MEDIA_TYPE => AppError::BadRequest(
                    "Content-Type must be application/json".to_string(),
                ),
                _ => AppError::BadRequest(rejection.body_text()),
            })?;

        let parsed = serde_json::from_value::<T>(value).map_err(|error| {
            let field = error
                .to_string()
                .split(" at line ")
                .next()
                .unwrap_or("payload")
                .to_string();
            validation_error("payload", field)
        })?;

        Ok(ApiJson(parsed))
    }
}
