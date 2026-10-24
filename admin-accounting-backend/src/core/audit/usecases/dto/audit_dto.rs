use serde::{Deserialize, Serialize};

use crate::core::audit::entities::{AuditLogChange, AuditLogEntry};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAuditLogRequest {
    pub module: String,
    pub entity_type: String,
    pub entity_id: String,
    #[serde(default)]
    pub document_number: String,
    pub action: String,
    pub status: String,
    #[serde(default)]
    pub actor: String,
    #[serde(default)]
    pub timestamp: Option<String>,
    #[serde(default)]
    pub summary: String,
    /// `message` is accepted as an alias so older transaction payloads keep
    /// working while the UI standardizes on `description`.
    #[serde(default, alias = "message")]
    pub description: String,
    #[serde(default)]
    pub changes: Vec<AuditLogChange>,
}

#[derive(Debug, Clone, Default)]
pub struct ListAuditLogsRequest {
    pub module: Option<String>,
    pub entity_type: Option<String>,
    pub entity_id: Option<String>,
    pub search: Option<String>,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PageMeta {
    pub page: u32,
    pub limit: u32,
    pub total: i64,
}

#[derive(Debug, Clone)]
pub struct ListAuditLogsResult {
    pub items: Vec<AuditLogEntry>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}
