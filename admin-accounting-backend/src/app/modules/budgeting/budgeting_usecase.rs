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
        root_transaction_id: &str,
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
                root_transaction_id: root_transaction_id.to_string(),
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

    fn header_str<'a>(header: &'a Value, key: &str) -> &'a str {
        header.get(key).and_then(Value::as_str).unwrap_or_default()
    }

    fn validate_budget_total(
        dto: &CreateBudgetPlanDto,
        existing: Option<&Value>,
    ) -> Result<f64, AppError> {
        if dto.name.trim().is_empty() {
            return Err(AppError::BadRequest("Budget name is required".to_string()));
        }
        if !(2000..=2100).contains(&dto.fiscal_year) {
            return Err(AppError::BadRequest(
                "Fiscal year must be between 2000 and 2100".to_string(),
            ));
        }

        if !dto.lines.is_empty() {
            let mut total = 0.0;
            for line in &dto.lines {
                if line.allocated_amount < 0.0 {
                    return Err(AppError::BadRequest(
                        "Budget line amount cannot be negative".to_string(),
                    ));
                }
                total += line.allocated_amount;
            }
            return Ok(round2(total));
        }

        // Header-only budget (the current frontend form) is valid as long as
        // it carries a total. On update, keep the existing total when the
        // request only edits the header.
        if let Some(total) = dto.total_amount {
            if total < 0.0 {
                return Err(AppError::BadRequest(
                    "Budget total cannot be negative".to_string(),
                ));
            }
            return Ok(round2(total));
        }

        if let Some(header) = existing {
            let total = header
                .get("total_amount")
                .and_then(Value::as_f64)
                .unwrap_or(0.0);
            return Ok(round2(total));
        }

        Err(AppError::BadRequest(
            "Budget total is required when no detail lines are supplied".to_string(),
        ))
    }

    fn validate_expense_totals(dto: &CreateExpenseDto) -> Result<(f64, f64, f64), AppError> {
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
            return Err(AppError::BadRequest(format!(
                "Invalid expense type `{}`. Allowed: {}",
                dto.expense_type,
                TYPES.join(", ")
            )));
        }
        if dto.lines.is_empty() {
            return Err(AppError::BadRequest(
                "At least one expense line is required".to_string(),
            ));
        }

        let mut subtotal = 0.0;
        let mut tax_amount = 0.0;
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
        }

        let subtotal = round2(subtotal);
        let tax_amount = round2(tax_amount);
        Ok((subtotal, tax_amount, round2(subtotal + tax_amount)))
    }

    fn normalize_page(query: &BudgetListQuery) -> (u64, u64, BudgetListQuery) {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);
        (
            page,
            limit,
            BudgetListQuery {
                page: Some(page),
                limit: Some(limit),
                ..query.clone()
            },
        )
    }

    fn ensure_status(current: &str, allowed: &[&str], action: &str) -> Result<(), AppError> {
        if allowed.contains(&current) {
            Ok(())
        } else {
            Err(AppError::Conflict(format!(
                "Cannot {action} a document with status `{current}`"
            )))
        }
    }
}

#[async_trait]
impl IBudgetingUsecase for BudgetingUsecase {
    async fn list_budgets(
        &self,
        query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        let (page, limit, normalized) = Self::normalize_page(&query);
        let (items, total) = self.repo.list_budgets(&normalized).await?;
        Ok((items, PaginationMeta::new(page, limit, total)))
    }

    async fn get_budget(&self, id: i64) -> Result<BudgetDocumentResponse, AppError> {
        self.repo
            .get_budget(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Budget plan not found".to_string()))
    }

    async fn create_budget(
        &self,
        dto: CreateBudgetPlanDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let total = Self::validate_budget_total(&dto, None)?;
        let number = match dto.budget_number.as_deref().map(str::trim) {
            Some(value) if !value.is_empty() => value.to_string(),
            _ => self.repo.next_number("BUD").await?,
        };
        let id = self.repo.create_budget(&number, &dto, total).await?;
        let created = self.get_budget(id).await?;
        let root = Self::header_str(&created.header, "root_transaction_id").to_string();
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            &root,
            "create",
            "draft",
            dto.prepared_by.map(|id| id.to_string()),
            format!("Created budget plan {number}"),
        )
        .await;
        Ok(created)
    }

    async fn update_budget(
        &self,
        id: i64,
        dto: CreateBudgetPlanDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_budget(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["draft", "rejected"], "edit")?;
        let number = Self::header_str(&existing.header, "budget_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        let total = Self::validate_budget_total(&dto, Some(&existing.header))?;
        self.repo.update_budget(id, &dto, total).await?;
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            &root,
            "update",
            "draft",
            dto.prepared_by.map(|id| id.to_string()),
            format!("Updated budget plan {number}"),
        )
        .await;
        self.get_budget(id).await
    }

    async fn delete_budget(&self, id: i64) -> Result<(), AppError> {
        let existing = self.get_budget(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["draft", "rejected"], "delete")?;
        let number = Self::header_str(&existing.header, "budget_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo.delete_budget(id).await?;
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            &root,
            "delete",
            "deleted",
            None,
            format!("Deleted budget plan {number}"),
        )
        .await;
        Ok(())
    }

    async fn submit_budget(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_budget(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["draft", "rejected", "created"], "submit")?;
        let number = Self::header_str(&existing.header, "budget_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo
            .set_budget_status(id, "pending", dto.actor_id, None)
            .await?;
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            &root,
            "submit",
            "pending",
            dto.actor,
            format!("Submitted budget plan {number} for approval"),
        )
        .await;
        self.get_budget(id).await
    }

    async fn reject_budget(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_budget(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["pending", "approved", "created"], "reject")?;
        let number = Self::header_str(&existing.header, "budget_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo
            .set_budget_status(id, "rejected", dto.actor_id, dto.reason.as_deref())
            .await?;
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            &root,
            "reject",
            "rejected",
            dto.actor,
            dto.reason
                .unwrap_or_else(|| format!("Rejected budget plan {number}")),
        )
        .await;
        self.get_budget(id).await
    }

    async fn close_budget(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_budget(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["approved"], "close")?;
        let number = Self::header_str(&existing.header, "budget_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo
            .set_budget_status(id, "completed", dto.actor_id, None)
            .await?;
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            &root,
            "close",
            "completed",
            dto.actor,
            format!("Closed budget plan {number}"),
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
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["pending", "draft", "created"], "approve")?;
        let number = Self::header_str(&existing.header, "budget_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo.approve_budget(id, dto.actor_id).await?;
        self.write_audit(
            "budgeting",
            "budget_plan",
            id,
            &number,
            &root,
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
        let (page, limit, normalized) = Self::normalize_page(&query);
        let (items, total) = self.repo.list_allocations(&normalized).await?;
        Ok((items, PaginationMeta::new(page, limit, total)))
    }

    async fn get_allocation(&self, id: i64) -> Result<BudgetDocumentResponse, AppError> {
        self.repo
            .get_allocation(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Budget allocation not found".to_string()))
    }

    async fn create_allocation(
        &self,
        dto: CreateAllocationDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let budget = self.get_budget(dto.budget_plan_id).await?;
        let status = Self::header_str(&budget.header, "status");
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
            _ => self.repo.next_number("ALLOC").await?,
        };
        let id = self.repo.create_allocation(&number, &dto).await?;
        let created = self.get_allocation(id).await?;
        let root = Self::header_str(&created.header, "root_transaction_id").to_string();
        self.write_audit(
            "budgeting",
            "budget_allocation",
            id,
            &number,
            &root,
            "create",
            "draft",
            dto.prepared_by.map(|id| id.to_string()),
            format!("Created budget allocation {number}"),
        )
        .await;
        Ok(created)
    }

    async fn update_allocation(
        &self,
        id: i64,
        dto: CreateAllocationDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_allocation(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["draft", "rejected"], "edit")?;
        let number = Self::header_str(&existing.header, "allocation_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo.update_allocation(id, &dto).await?;
        self.write_audit(
            "budgeting",
            "budget_allocation",
            id,
            &number,
            &root,
            "update",
            "draft",
            dto.prepared_by.map(|id| id.to_string()),
            format!("Updated budget allocation {number}"),
        )
        .await;
        self.get_allocation(id).await
    }

    async fn delete_allocation(&self, id: i64) -> Result<(), AppError> {
        let existing = self.get_allocation(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["draft", "rejected"], "delete")?;
        let number = Self::header_str(&existing.header, "allocation_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo.delete_allocation(id).await?;
        self.write_audit(
            "budgeting",
            "budget_allocation",
            id,
            &number,
            &root,
            "delete",
            "deleted",
            None,
            format!("Deleted budget allocation {number}"),
        )
        .await;
        Ok(())
    }

    async fn approve_allocation(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_allocation(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["pending", "draft", "created"], "approve")?;
        let number = Self::header_str(&existing.header, "allocation_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo.approve_allocation(id, dto.actor_id).await?;
        self.write_audit(
            "budgeting",
            "budget_allocation",
            id,
            &number,
            &root,
            "approve",
            "approved",
            dto.actor,
            format!("Approved budget allocation {number}"),
        )
        .await;
        self.get_allocation(id).await
    }

    async fn reject_allocation(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_allocation(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["pending", "approved", "created"], "reject")?;
        let number = Self::header_str(&existing.header, "allocation_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo
            .set_allocation_status(id, "rejected", dto.actor_id)
            .await?;
        self.write_audit(
            "budgeting",
            "budget_allocation",
            id,
            &number,
            &root,
            "reject",
            "rejected",
            dto.actor,
            dto.reason
                .unwrap_or_else(|| format!("Rejected budget allocation {number}")),
        )
        .await;
        self.get_allocation(id).await
    }

    async fn list_expenses(
        &self,
        query: BudgetListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        let (page, limit, normalized) = Self::normalize_page(&query);
        let (items, total) = self.repo.list_expenses(&normalized).await?;
        Ok((items, PaginationMeta::new(page, limit, total)))
    }

    async fn get_expense(&self, id: i64) -> Result<BudgetDocumentResponse, AppError> {
        self.repo
            .get_expense(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Expense not found".to_string()))
    }

    async fn create_expense(
        &self,
        dto: CreateExpenseDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let (subtotal, tax_amount, grand_total) = Self::validate_expense_totals(&dto)?;

        let mut allocation_usage: std::collections::HashMap<i64, f64> =
            std::collections::HashMap::new();
        for line in &dto.lines {
            if let Some(allocation_id) = line.budget_allocation_id {
                let used = allocation_usage.entry(allocation_id).or_insert(0.0);
                *used += line.amount + line.tax_amount.unwrap_or(0.0);
            }
        }
        for (allocation_id, requested) in allocation_usage {
            let remaining = self.repo.allocation_detail_remaining(allocation_id).await?;
            if remaining + 0.0001 < requested {
                return Err(AppError::BadRequest(format!(
                    "Budget allocation detail {allocation_id} does not have enough remaining budget"
                )));
            }
        }

        let number = match dto.document_number.as_deref().map(str::trim) {
            Some(value) if !value.is_empty() => value.to_string(),
            _ => self.repo.next_number("EXP").await?,
        };
        let id = self
            .repo
            .create_expense(&number, &dto, subtotal, tax_amount, grand_total)
            .await?;
        let created = self.get_expense(id).await?;
        let root = Self::header_str(&created.header, "root_transaction_id").to_string();
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            &root,
            "create",
            "draft",
            dto.actor
                .clone()
                .or_else(|| dto.prepared_by.map(|id| id.to_string())),
            format!("Created expense {number}"),
        )
        .await;
        Ok(created)
    }

    async fn update_expense(
        &self,
        id: i64,
        dto: CreateExpenseDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_expense(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["draft", "rejected", "created"], "edit")?;
        let number = Self::header_str(&existing.header, "document_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        let (subtotal, tax_amount, grand_total) = Self::validate_expense_totals(&dto)?;
        self.repo
            .update_expense(id, &dto, subtotal, tax_amount, grand_total)
            .await?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            &root,
            "update",
            current,
            dto.actor
                .clone()
                .or_else(|| dto.prepared_by.map(|id| id.to_string())),
            format!("Updated expense {number}"),
        )
        .await;
        self.get_expense(id).await
    }

    async fn delete_expense(&self, id: i64) -> Result<(), AppError> {
        let existing = self.get_expense(id).await?;
        let current = Self::header_str(&existing.header, "status");
        if current == "approved" || current == "completed" {
            return Err(AppError::Conflict(
                "Approved or posted expenses cannot be deleted".to_string(),
            ));
        }
        let number = Self::header_str(&existing.header, "document_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo.delete_expense(id).await?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            &root,
            "delete",
            "deleted",
            None,
            format!("Deleted expense {number}"),
        )
        .await;
        Ok(())
    }

    async fn submit_expense(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_expense(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["draft", "rejected", "created"], "submit")?;
        let number = Self::header_str(&existing.header, "document_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo
            .set_expense_status(id, "pending", dto.actor_id, None)
            .await?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            &root,
            "submit",
            "pending",
            dto.actor,
            format!("Submitted expense {number} for approval"),
        )
        .await;
        self.get_expense(id).await
    }

    async fn reject_expense(
        &self,
        id: i64,
        dto: ApproveBudgetDto,
    ) -> Result<BudgetDocumentResponse, AppError> {
        let existing = self.get_expense(id).await?;
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["pending", "approved", "created"], "reject")?;
        let number = Self::header_str(&existing.header, "document_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo
            .set_expense_status(id, "rejected", dto.actor_id, dto.reason.as_deref())
            .await?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            &root,
            "reject",
            "rejected",
            dto.actor,
            dto.reason
                .unwrap_or_else(|| format!("Rejected expense {number}")),
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
        let current = Self::header_str(&existing.header, "status");
        Self::ensure_status(current, &["pending", "draft", "created"], "approve")?;
        let number = Self::header_str(&existing.header, "document_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo.approve_expense(id, dto.actor_id).await?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            &root,
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
        let number = Self::header_str(&existing.header, "document_number").to_string();
        let root = Self::header_str(&existing.header, "root_transaction_id").to_string();

        self.repo.post_expense(id, dto.actor_id).await?;
        self.write_audit(
            "expenses",
            "expense",
            id,
            &number,
            &root,
            "post",
            "completed",
            dto.actor,
            format!("Posted expense {number} to general ledger"),
        )
        .await;
        self.get_expense(id).await
    }

    async fn budget_vs_actual(&self) -> Result<Value, AppError> {
        self.repo.budget_vs_actual().await
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
