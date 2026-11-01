use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogChange {
    pub field: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub before: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub after: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogEntry {
    pub id: String,
    #[serde(default)]
    pub root_transaction_id: String,
    pub module: String,
    pub entity_type: String,
    pub entity_id: String,
    pub document_number: String,
    pub action: String,
    pub status: String,
    pub actor: String,
    pub timestamp: String,
    pub summary: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub changes: Vec<AuditLogChange>,
}

#[derive(Debug, Clone, Default)]
pub struct AuditFilter {
    pub root_transaction_id: Option<String>,
    pub module: Option<String>,
    pub entity_type: Option<String>,
    pub entity_id: Option<String>,
    pub search: Option<String>,
    /// Timeline queries must be chronological (oldest first), while the
    /// general activity feed stays newest first.
    pub ascending: bool,
    pub offset: i64,
    pub limit: i64,
}
