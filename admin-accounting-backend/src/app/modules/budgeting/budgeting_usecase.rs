use std::sync::Arc;

use async_trait::async_trait;
use serde_json::Value;

use super::budgeting_dto::{
    ApproveBudgetDto, BudgetDocumentResponse, BudgetListQuery, CreateAllocationDto,
    CreateBudgetPlanDto, CreateExpenseDto,
};
use super::budgeting_interfaces::{IBudgetingRepo, IBudgetingUsecase};
use crate::app::modules::audit_log::{CreateAuditDto, IAuditLogUsecase};
use crate::pkg::constans::constants::{DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

pub struct BudgetingUsecase {
    repo: Arc<dyn IBudgetingRepo>,
    audit: Arc<dyn IAuditLogUsecase>,
}

impl BudgetingUsecase {
    pub fn new(repo: Arc<dyn IBudgetingRepo>, audit: Arc<dyn IAuditLogUsecase>) -> Self {
        Self { repo, audit }
    }

    #[allow(clippy::too_many_arguments)]
    async fn write_audit(
        &self,
        module: &str,
        entity_type: &str,
        id: i64,
        document_number: &str,
        action: &str,
        status: &str,
        actor: Option<String>,
        summary: String,
    ) {
        let result = self
            .audit
            .create(CreateAuditDto {
                module: module.to_string(),
                entity_type: entity_type.to_string(),
                entity_id: id.to_string(),
                document_number: document_number.to_string(),
                action: action.to_string(),
                status: status.to_string(),
                actor: actor.unwrap_or_else(|| "system".to_string()),
                summary,
                description: String::new(),
                changes: Vec::new(),
            })
            .await;

        if let Err(error) = result {
            tracing::warn!(?error, "failed to write budgeting audit log");
        }
    }

    fn validate_lines(lines: &[super::budgeting_dto::BudgetPlanLineDto]) -> Result<f64, AppError> {
        if lines.is_empty() {
            return Err(AppError::BadRequest(
                "At least one budget line is required".to_string(),
            ));
        }
        let mut total = 0.0;
        for line in lines {
            if line.allocated_amount < 0.0 {
                return Err(AppError::BadRequest(
                    "Budget line amount cannot be negative".to_string(),
                ));
            }
            total += line.allocated_amount;
        }
        Ok(round2(total))
    }
}

#[async_trait]
impl IBudgetingUsecase for BudgetingUsecase {
    async fn list_budgets(
        &self,
        query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);
        let normalized = BudgetListQuery {
            page: Some(page),
            limit: Some(limit),
            ..query
        };
        let (items, total) = self
            .repo
            .list_budgets(&normalized)
            .await
            .map_err(AppError::Database)?;
        Ok((items, PaginationMeta::new(page, limit, total)))
    }

    async fn get_budget(&self, id: i64) -> Result<BudgetDocumentResponse, AppError> {
        self.repo
            .get_budget(id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Budget plan not found".to_string()))
    }

    async fn create_budget(
        &self,
        dto: CreateBudgetPlanDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        if dto.name.trim().is_empty() {
            return Err(AppError::BadRequest("Budget name is required".to_string()));
        }
        if !(2000..=2100).contains(&dto.fiscal_year) {
            return Err(AppError::BadRequest(
                "Fiscal year must be between 2000 and 2100".to_string(),
            ));
        }
        let total = Self::validate_lines(&dto.lines)?;
        let number = match dto.budget_number.as_deref().map(str::trim) {
            Some(value) if !value.is_empty() => value.to_string(),
            _ => self
                .repo
                .next_number("BUD")
                .await
                .map_err(AppError::Database)?,
        };
        let id = self
            .repo
            .create_budget(&number, &dto, total)
            .await
            .map_err(AppError::Database)?;
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            "create",
            "draft",
            dto.prepared_by.map(|id| id.to_string()),
            format!("Created budget plan {number}"),
        )
        .await;
        self.get_budget(id).await
    }

    async fn approve_budget(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_budget(id).await?;
        let number = existing
            .header
            .get("budget_number")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_string();
        self.repo
            .approve_budget(id, dto.actor_id)
            .await
            .map_err(AppError::Database)?;
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            "approve",
            "approved",
            dto.actor,
            format!("Approved budget plan {number}"),
        )
        .await;
        self.get_budget(id).await
    }

    async fn list_allocations(
        &self,
        query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);
        let normalized = BudgetListQuery {
            page: Some(page),
            limit: Some(limit),
            ..query
        };
        let (items, total) = self
            .repo
            .list_allocations(&normalized)
            .await
            .map_err(AppError::Database)?;
        Ok((items, PaginationMeta::new(page, limit, total)))
    }

    async fn get_allocation(&self, id: i64) -> Result<BudgetDocumentResponse, AppError> {
        self.repo
            .get_allocation(id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Budget allocation not found".to_string()))
    }

    async fn create_allocation(
        &self,
        dto: CreateAllocationDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let budget = self.get_budget(dto.budget_plan_id).await?;
        let status = budget
            .header
            .get("status")
            .and_then(Value::as_str)
            .unwrap_or_default();
        if status != "approved" {
            return Err(AppError::BadRequest(
                "Budget plan must be approved before allocation".to_string(),
            ));
        }

        for line in &dto.lines {
            if line.allocated_amount < 0.0 {
                return Err(AppError::BadRequest(
                    "Allocation amount cannot be negative".to_string(),
                ));
            }
        }

        let number = match dto.allocation_number.as_deref().map(str::trim) {
            Some(value) if !value.is_empty() => value.to_string(),
            _ => self
                .repo
                .next_number("ALLOC")
                .await
                .map_err(AppError::Database)?,
        };
        let id = self
            .repo
            .create_allocation(&number, &dto)
            .await
            .map_err(AppError::Database)?;
        self.write_audit(
            "budgeting",
            "budget_allocation",
            id,
            &number,
            "create",
            "draft",
            dto.prepared_by.map(|id| id.to_string()),
            format!("Created budget allocation {number}"),
        )
        .await;
        self.get_allocation(id).await
    }

    async fn approve_allocation(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_allocation(id).await?;
        let number = existing
            .header
            .get("allocation_number")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_string();
        self.repo
            .approve_allocation(id, dto.actor_id)
            .await
            .map_err(AppError::Database)?;
        self.write_audit(
            "budgeting",
            "budget_allocation",
            id,
            &number,
            "approve",
            "approved",
            dto.actor,
            format!("Approved budget allocation {number}"),
        )
        .await;
        self.get_allocation(id).await
    }

    async fn list_expenses(
        &self,
        query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);
        let normalized = BudgetListQuery {
            page: Some(page),
            limit: Some(limit),
            ..query
        };
        let (items, total) = self
            .repo
            .list_expenses(&normalized)
            .await
            .map_err(AppError::Database)?;
        Ok((items, PaginationMeta::new(page, limit, total)))
    }

    async fn get_expense(&self, id: i64) -> Result<BudgetDocumentResponse, AppError> {
        self.repo
            .get_expense(id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Expense not found".to_string()))
    }

    async fn create_expense(
        &self,
        dto: CreateExpenseDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        const TYPES: &[&str] = &[
            "salary",
            "purchase",
            "office_supplies",
            "utilities",
            "logistics",
            "maintenance",
            "travel",
            "other",
        ];
        if !TYPES.contains(&dto.expense_type.as_str()) {
            return Err(AppError::BadRequest("Invalid expense type".to_string()));
        }
        if dto.lines.is_empty() {
            return Err(AppError::BadRequest(
                "At least one expense line is required".to_string(),
            ));
        }

        let mut subtotal = 0.0;
        let mut tax_amount = 0.0;
        let mut allocation_usage: std::collections::HashMap<i64, f64> =
            std::collections::HashMap::new();

        for line in &dto.lines {
            if line.amount <= 0.0 {
                return Err(AppError::BadRequest(
                    "Expense line amount must be greater than zero".to_string(),
                ));
            }
            let tax = line.tax_amount.unwrap_or(0.0);
            if tax < 0.0 {
                return Err(AppError::BadRequest(
                    "Expense tax cannot be negative".to_string(),
                ));
            }
            subtotal += line.amount;
            tax_amount += tax;

            if let Some(allocation_id) = line.budget_allocation_id {
                let used = allocation_usage.entry(allocation_id).or_insert(0.0);
                *used += line.amount + tax;
            }
        }

        for (allocation_id, requested) in allocation_usage {
            let remaining = self
                .repo
                .allocation_detail_remaining(allocation_id)
                .await
                .map_err(AppError::Database)?;
            if remaining + 0.0001 < requested {
                return Err(AppError::BadRequest(format!(
                    "Budget allocation detail {allocation_id} does not have enough remaining budget"
                )));
            }
        }

        let subtotal = round2(subtotal);
        let tax_amount = round2(tax_amount);
        let grand_total = round2(subtotal + tax_amount);
        let number = match dto.document_number.as_deref().map(str::trim) {
            Some(value) if !value.is_empty() => value.to_string(),
            _ => self
                .repo
                .next_number("EXP")
                .await
                .map_err(AppError::Database)?,
        };
        let id = self
            .repo
            .create_expense(&number, &dto, subtotal, tax_amount, grand_total)
            .await
            .map_err(AppError::Database)?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            "create",
            "draft",
            dto.actor
                .clone()
                .or_else(|| dto.prepared_by.map(|id| id.to_string())),
            format!("Created expense {number}"),
        )
        .await;
        self.get_expense(id).await
    }

    async fn approve_expense(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_expense(id).await?;
        let number = existing
            .header
            .get("document_number")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_string();
        self.repo
            .approve_expense(id, dto.actor_id)
            .await
            .map_err(AppError::Database)?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            "approve",
            "approved",
            dto.actor,
            format!("Approved expense {number}"),
        )
        .await;
        self.get_expense(id).await
    }

    async fn post_expense(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_expense(id).await?;
        let number = existing
            .header
            .get("document_number")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_string();
        self.repo
            .post_expense(id, dto.actor_id)
            .await
            .map_err(AppError::Database)?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            "post",
            "completed",
            dto.actor,
            format!("Posted expense {number} to general ledger"),
        )
        .await;
        self.get_expense(id).await
    }

    async fn budget_vs_actual(&self) -> Result<Value, AppError> {
        self.repo
            .budget_vs_actual()
            .await
            .map_err(AppError::Database)
    }
}

fn round2(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rounds_money_to_two_decimals() {
        assert_eq!(round2(1.006), 1.01);
        assert_eq!(round2(1.004), 1.0);
        assert_eq!(round2(1000.0), 1000.0);
    }
}
