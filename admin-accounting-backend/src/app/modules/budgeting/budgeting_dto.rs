use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize)]
pub struct CreateBudgetPlanDto {
    #[serde(default, alias = "budgetNumber")]
    pub budget_number: Option<String>,
    #[serde(alias = "fiscalYear")]
    pub fiscal_year: i32,
    pub name: String,
    #[serde(default, alias = "departmentId")]
    pub department_id: Option<i64>,
    #[serde(default)]
    pub prepared_by: Option<i64>,
    #[serde(default)]
    pub notes: Option<String>,
    /// Header-only budgets are allowed; when lines are empty this amount is
    /// used as the plan total. Line totals take precedence otherwise.
    #[serde(default, alias = "totalAmount")]
    pub total_amount: Option<f64>,
    #[serde(default)]
    pub lines: Vec<BudgetPlanLineDto>,
}

#[derive(Debug, Deserialize)]
pub struct BudgetPlanLineDto {
    #[serde(alias = "coaId")]
    pub coa_id: i64,
    #[serde(default, alias = "departmentId")]
    pub department_id: Option<i64>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(alias = "allocatedAmount")]
    pub allocated_amount: f64,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAllocationDto {
    #[serde(default, alias = "allocationNumber")]
    pub allocation_number: Option<String>,
    #[serde(alias = "budgetId", alias = "budgetPlanId")]
    pub budget_plan_id: i64,
    #[serde(alias = "allocationDate")]
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
    #[serde(default, alias = "budgetPlanDetailId")]
    pub budget_plan_detail_id: Option<i64>,
    #[serde(alias = "coaId")]
    pub coa_id: i64,
    #[serde(default, alias = "departmentId")]
    pub department_id: Option<i64>,
    #[serde(alias = "allocatedAmount")]
    pub allocated_amount: f64,
    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateExpenseDto {
    #[serde(default, alias = "documentNumber")]
    pub document_number: Option<String>,
    #[serde(alias = "documentDate", alias = "date")]
    pub document_date: NaiveDate,
    #[serde(alias = "expenseType")]
    pub expense_type: String,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default, alias = "departmentId")]
    pub department_id: Option<i64>,
    #[serde(default, alias = "costCenterId")]
    pub cost_center_id: Option<i64>,
    #[serde(default, alias = "budgetPlanId", alias = "budgetId")]
    pub budget_plan_id: Option<i64>,
    #[serde(default, alias = "budgetAllocationId")]
    pub budget_allocation_id: Option<i64>,
    #[serde(default, alias = "employeeId")]
    pub employee_id: Option<i64>,
    #[serde(default, alias = "supplierId")]
    pub supplier_id: Option<i64>,
    #[serde(default, alias = "paidTo")]
    pub paid_to: Option<String>,
    #[serde(default, alias = "paymentMethod")]
    pub payment_method: Option<String>,
    #[serde(default, alias = "bankAccountId")]
    pub bank_account_id: Option<i64>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub prepared_by: Option<i64>,
    #[serde(default)]
    pub submitted_by: Option<i64>,
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default)]
    pub lines: Vec<ExpenseLineDto>,
}

#[derive(Debug, Deserialize)]
pub struct ExpenseLineDto {
    #[serde(alias = "coaId", alias = "accountId")]
    pub coa_id: i64,
    #[serde(default)]
    pub description: Option<String>,
    pub amount: f64,
    #[serde(default, alias = "taxRateId")]
    pub tax_rate_id: Option<i64>,
    #[serde(default, alias = "taxAmount")]
    pub tax_amount: Option<f64>,
    #[serde(default, alias = "budgetAllocationId")]
    pub budget_allocation_id: Option<i64>,
}

#[derive(Debug, Clone, Deserialize)]
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

#[derive(Debug, Deserialize, Default)]
pub struct ApproveBudgetDto {
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default, alias = "actorId")]
    pub actor_id: Option<i64>,
    #[serde(default)]
    pub reason: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BudgetDocumentResponse {
    pub header: Value,
    pub lines: Vec<Value>,
}
