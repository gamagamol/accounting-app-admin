use serde::{Deserialize, Serialize};

use super::audit_log_entity::AuditLogChange;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAuditDto {
    #[serde(default)]
    pub root_transaction_id: String,
    pub module: String,
    pub entity_type: String,
    pub entity_id: String,
    #[serde(default)]
    pub document_number: String,
    pub action: String,
    pub status: String,
    #[serde(default)]
    pub actor: String,
    pub summary: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub changes: Vec<AuditLogChange>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListAuditQuery {
    #[serde(default)]
    pub root_transaction_id: Option<String>,
    pub module: Option<String>,
    pub entity_type: Option<String>,
    pub entity_id: Option<String>,
    pub search: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct DeleteEntityAuditResponse {
    pub deleted: u64,
}
