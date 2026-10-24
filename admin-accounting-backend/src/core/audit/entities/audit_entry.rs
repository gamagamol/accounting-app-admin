use serde::{Deserialize, Serialize};
use serde_json::Value;

pub const AUDIT_ACTIONS: [&str; 11] = [
    "create", "update", "delete", "submit", "approve", "reject", "post", "void", "close", "reopen",
    "export",
];

pub const AUDIT_STATUSES: [&str; 7] = [
    "draft",
    "created",
    "approved",
    "rejected",
    "pending",
    "completed",
    "reopen",
];

pub fn is_valid_audit_action(action: &str) -> bool {
    AUDIT_ACTIONS.contains(&action)
}

pub fn is_valid_audit_status(status: &str) -> bool {
    AUDIT_STATUSES.contains(&status)
}

/// A single before/after field change attached to an audit event.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogChange {
    pub field: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub before: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub after: Option<Value>,
}

/// Audit trail event persisted in MongoDB.
///
/// `id` is stored as a normal document field so the API and frontend can use
/// the same string identifier. MongoDB still adds its internal `_id`.
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
