use serde::Serialize;
use serde_json::Value;

/// Response envelope consumed by the frontend through `parsed?.data ?? parsed`.
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<Value>,
}

impl<T> ApiResponse<T> {
    pub fn success(message: impl Into<String>, data: T) -> Self {
        Self {
            success: true,
            message: message.into(),
            data: Some(data),
            meta: None,
            errors: None,
        }
    }

    pub fn success_with_meta(message: impl Into<String>, data: T, meta: Value) -> Self {
        Self {
            success: true,
            message: message.into(),
            data: Some(data),
            meta: Some(meta),
            errors: None,
        }
    }

    pub fn success_without_data(message: impl Into<String>) -> Self {
        Self {
            success: true,
            message: message.into(),
            data: None,
            meta: None,
            errors: None,
        }
    }
}

impl ApiResponse<()> {
    pub fn error(message: impl Into<String>, errors: Option<Value>) -> Self {
        Self {
            success: false,
            message: message.into(),
            data: None,
            meta: None,
            errors,
        }
    }
}
