use serde::{Deserialize, Serialize};

use crate::core::pending::entities::PendingRequest;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePendingRequest {
    pub transaction_type: String,
    pub transaction_id: String,
    #[serde(default)]
    pub transaction_number: String,
    pub requested_by: String,
    /// `message` is accepted as an alias for the reason shown in the UI.
    #[serde(default, alias = "message")]
    pub pending_message: String,
    #[serde(default)]
    pub actor_role: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingDecisionRequest {
    pub actor: String,
    #[serde(default)]
    pub actor_role: String,
    /// `message` is accepted as an alias for the approval/rejection note.
    #[serde(default, alias = "message")]
    pub decision_message: String,
}

#[derive(Debug, Clone, Default)]
pub struct ListPendingRequest {
    pub transaction_type: Option<String>,
    pub transaction_id: Option<String>,
    pub status: Option<String>,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingPageMeta {
    pub page: u32,
    pub limit: u32,
    pub total: i64,
}

#[derive(Debug, Clone)]
pub struct ListPendingResult {
    pub items: Vec<PendingRequest>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}
