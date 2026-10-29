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
    pub module: Option<String>,
    pub entity_type: Option<String>,
    pub entity_id: Option<String>,
    pub search: Option<String>,
    pub offset: i64,
    pub limit: i64,
}
