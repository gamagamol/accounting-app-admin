use async_trait::async_trait;
use serde_json::Value;

use super::budgeting_dto::{
    ApproveBudgetDto, BudgetDocumentResponse, BudgetListQuery, CreateAllocationDto,
    CreateBudgetPlanDto, CreateExpenseDto,
};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

#[async_trait]
pub trait IBudgetingRepo: Send + Sync {
    async fn list_budgets(&self, query: &BudgetListQuery) -> Result<(Vec<Value>, u64), String>;
    async fn get_budget(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, String>;
    async fn create_budget(
        &self,
        number: &str,
        dto: &CreateBudgetPlanDto,
        total_amount: f64,
    ) -> Result<i64, String>;
    async fn approve_budget(&self, id: i64, actor_id: Option<i64>) -> Result<(), String>;

    async fn list_allocations(&self, query: &BudgetListQuery) -> Result<(Vec<Value>, u64), String>;
    async fn get_allocation(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, String>;
    async fn create_allocation(
        &self,
        number: &str,
        dto: &CreateAllocationDto,
    ) -> Result<i64, String>;
    async fn approve_allocation(&self, id: i64, actor_id: Option<i64>) -> Result<(), String>;

    async fn list_expenses(&self, query: &BudgetListQuery) -> Result<(Vec<Value>, u64), String>;
    async fn get_expense(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, String>;
    async fn create_expense(
        &self,
        number: &str,
        dto: &CreateExpenseDto,
        subtotal: f64,
        tax_amount: f64,
        grand_total: f64,
    ) -> Result<i64, String>;
    async fn approve_expense(&self, id: i64, actor_id: Option<i64>) -> Result<(), String>;
    async fn post_expense(&self, id: i64, actor_id: Option<i64>) -> Result<(), String>;

    async fn budget_vs_actual(&self) -> Result<Value, String>;
    async fn next_number(&self, prefix: &str) -> Result<String, String>;
    async fn allocation_detail_remaining(&self, id: i64) -> Result<f64, String>;
}

#[async_trait]
pub trait IBudgetingUsecase: Send + Sync {
    async fn list_budgets(
        &self,
        query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError>;
    async fn get_budget(&self, id: i64) -> Result<BudgetDocumentResponse, AppError>;
    async fn create_budget(
        &self,
        dto: CreateBudgetPlanDto,
    ) -> Result<BudgetDocumentResponse, AppError>;
    async fn approve_budget(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError>;

    async fn list_allocations(
        &self,
        query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError>;
    async fn get_allocation(&self, id: i64) -> Result<BudgetDocumentResponse, AppError>;
    async fn create_allocation(
        &self,
        dto: CreateAllocationDto,
    ) -> Result<BudgetDocumentResponse, AppError>;
    async fn approve_allocation(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError>;

    async fn list_expenses(
        &self,
        query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError>;
    async fn get_expense(&self, id: i64) -> Result<BudgetDocumentResponse, AppError>;
    async fn create_expense(
        &self,
        dto: CreateExpenseDto,
    ) -> Result<BudgetDocumentResponse, AppError>;
    async fn approve_expense(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError>;
    async fn post_expense(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError>;

    async fn budget_vs_actual(&self) -> Result<Value, AppError>;
}
