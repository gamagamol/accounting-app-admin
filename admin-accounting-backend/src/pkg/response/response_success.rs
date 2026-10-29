use serde::Serialize;
use serde_json::Value;

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<PaginationMeta>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<Value>,
}

#[derive(Debug, Clone, Serialize)]
pub struct PaginationMeta {
    pub page: u64,
    pub limit: u64,
    pub total: u64,
    #[serde(rename = "totalPages")]
    pub total_pages: u64,
}

impl PaginationMeta {
    pub fn new(page: u64, limit: u64, total: u64) -> Self {
        let total_pages = if limit == 0 { 0 } else { total.div_ceil(limit) };

        Self {
            page,
            limit,
            total,
            total_pages,
        }
    }
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

    pub fn paginated(message: impl Into<String>, data: T, meta: PaginationMeta) -> Self {
        Self {
            success: true,
            message: message.into(),
            data: Some(data),
            meta: Some(meta),
            errors: None,
        }
    }

    pub fn error(message: impl Into<String>, errors: Option<Value>) -> ApiResponse<()> {
        ApiResponse {
            success: false,
            message: message.into(),
            data: None,
            meta: None,
            errors,
        }
    }
}
