use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize)]
pub struct CreateBudgetPlanDto {
    #[serde(default)]
    pub budget_number: Option<String>,
    pub fiscal_year: i32,
    pub name: String,
    #[serde(default)]
    pub department_id: Option<i64>,
    #[serde(default)]
    pub prepared_by: Option<i64>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub lines: Vec<BudgetPlanLineDto>,
}

#[derive(Debug, Deserialize)]
pub struct BudgetPlanLineDto {
    pub coa_id: i64,
    #[serde(default)]
    pub department_id: Option<i64>,
    #[serde(default)]
    pub description: Option<String>,
    pub allocated_amount: f64,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAllocationDto {
    #[serde(default)]
    pub allocation_number: Option<String>,
    pub budget_plan_id: i64,
    pub allocation_date: NaiveDate,
    #[serde(default)]
    pub prepared_by: Option<i64>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub lines: Vec<AllocationLineDto>,
}

#[derive(Debug, Deserialize)]
pub struct AllocationLineDto {
    #[serde(default)]
    pub budget_plan_detail_id: Option<i64>,
    pub coa_id: i64,
    #[serde(default)]
    pub department_id: Option<i64>,
    pub allocated_amount: f64,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateExpenseDto {
    #[serde(default)]
    pub document_number: Option<String>,
    pub document_date: NaiveDate,
    pub expense_type: String,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub department_id: Option<i64>,
    #[serde(default)]
    pub cost_center_id: Option<i64>,
    #[serde(default)]
    pub budget_plan_id: Option<i64>,
    #[serde(default)]
    pub budget_allocation_id: Option<i64>,
    #[serde(default)]
    pub employee_id: Option<i64>,
    #[serde(default)]
    pub supplier_id: Option<i64>,
    #[serde(default)]
    pub paid_to: Option<String>,
    #[serde(default)]
    pub payment_method: Option<String>,
    #[serde(default)]
    pub bank_account_id: Option<i64>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub prepared_by: Option<i64>,
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default)]
    pub lines: Vec<ExpenseLineDto>,
}

#[derive(Debug, Deserialize)]
pub struct ExpenseLineDto {
    pub coa_id: i64,
    #[serde(default)]
    pub description: Option<String>,
    pub amount: f64,
    #[serde(default)]
    pub tax_rate_id: Option<i64>,
    #[serde(default)]
    pub tax_amount: Option<f64>,
    #[serde(default)]
    pub budget_allocation_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct BudgetListQuery {
    #[serde(default)]
    pub search: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub page: Option<u64>,
    #[serde(default)]
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct ApproveBudgetDto {
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default)]
    pub actor_id: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct BudgetDocumentResponse {
    pub header: Value,
    pub lines: Vec<Value>,
}
