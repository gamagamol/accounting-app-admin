use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Transaction types that support the pending approval workflow.
///
/// Keep this list in sync with the frontend `PendingTransactionType` union and
/// with `migrations/20261024000000_create_transaction_pending_tables.sql`.
pub const PENDING_TABLES: [(&str, &str); 21] = [
    ("quotation", "transaction_quotation_pending"),
    ("sales_order", "transaction_sales_order_pending"),
    ("purchase_order", "transaction_purchase_order_pending"),
    ("delivery_order", "transaction_delivery_order_pending"),
    ("goods_receipt", "transaction_goods_receipt_pending"),
    ("sales_invoice", "transaction_sales_invoice_pending"),
    ("customer_receipt", "transaction_customer_receipt_pending"),
    ("vendor_payment", "transaction_vendor_payment_pending"),
    ("debt_payment", "transaction_debt_payment_pending"),
    ("purchase_invoice", "transaction_purchase_invoice_pending"),
    ("sales_return", "transaction_sales_return_pending"),
    ("purchase_return", "transaction_purchase_return_pending"),
    ("stock_movement", "transaction_stock_movement_pending"),
    ("stock_adjustment", "transaction_stock_adjustment_pending"),
    ("annual_budget", "transaction_annual_budget_pending"),
    ("budget_allocation", "transaction_budget_allocation_pending"),
    ("budget_revision", "transaction_budget_revision_pending"),
    ("expense", "transaction_expense_pending"),
    ("journal_entry", "transaction_journal_entry_pending"),
    (
        "bank_reconciliation",
        "transaction_bank_reconciliation_pending",
    ),
    ("period_closing", "transaction_period_closing_pending"),
];

pub const PENDING_STATUSES: [&str; 3] = ["pending", "approved", "rejected"];

/// Roles allowed to decide a pending request. The frontend uses the same list
/// to show or hide the approve/reject buttons.
pub const APPROVER_ROLES: [&str; 3] = ["SUPER_ADMIN", "OWNER", "ACCOUNTING_ADMIN"];

pub fn pending_table_name(transaction_type: &str) -> Option<&'static str> {
    PENDING_TABLES
        .iter()
        .find(|(value, _)| *value == transaction_type)
        .map(|(_, table)| *table)
}

pub fn is_valid_pending_transaction_type(transaction_type: &str) -> bool {
    pending_table_name(transaction_type).is_some()
}

pub fn is_valid_pending_status(status: &str) -> bool {
    PENDING_STATUSES.contains(&status)
}

pub fn is_approver_role(role: &str) -> bool {
    APPROVER_ROLES.contains(&role)
}

/// One pending request row. The same shape is returned for every transaction
/// type; `transaction_type` identifies which `transaction_<type>_pending`
/// table the row came from.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingRequest {
    pub id: Uuid,
    pub transaction_type: String,
    pub transaction_id: String,
    pub transaction_number: String,
    pub status: String,
    pub requested_at: DateTime<Utc>,
    pub requested_by: String,
    pub pending_message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub approved_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub approved_by: Option<String>,
    pub approval_message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rejected_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rejected_by: Option<String>,
    pub rejection_message: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Database row shape. `transaction_type` is not stored in the per-type table,
/// so it is added when the row is mapped to `PendingRequest`.
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct PendingRequestRow {
    pub id: Uuid,
    pub transaction_id: String,
    pub transaction_number: String,
    pub status: String,
    pub requested_at: DateTime<Utc>,
    pub requested_by: String,
    pub pending_message: String,
    pub approved_at: Option<DateTime<Utc>>,
    pub approved_by: Option<String>,
    pub approval_message: String,
    pub rejected_at: Option<DateTime<Utc>>,
    pub rejected_by: Option<String>,
    pub rejection_message: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl PendingRequestRow {
    pub fn into_request(self, transaction_type: &str) -> PendingRequest {
        PendingRequest {
            id: self.id,
            transaction_type: transaction_type.to_string(),
            transaction_id: self.transaction_id,
            transaction_number: self.transaction_number,
            status: self.status,
            requested_at: self.requested_at,
            requested_by: self.requested_by,
            pending_message: self.pending_message,
            approved_at: self.approved_at,
            approved_by: self.approved_by,
            approval_message: self.approval_message,
            rejected_at: self.rejected_at,
            rejected_by: self.rejected_by,
            rejection_message: self.rejection_message,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

#[derive(Debug, Clone)]
pub struct PendingFilter {
    pub transaction_type: String,
    pub transaction_id: Option<String>,
    pub status: Option<String>,
    pub offset: i64,
    pub limit: i64,
}

#[derive(Debug, Clone)]
pub struct PendingDecision {
    pub status: String,
    pub actor: String,
    pub message: String,
    pub decided_at: DateTime<Utc>,
}
