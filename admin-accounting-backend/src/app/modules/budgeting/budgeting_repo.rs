use chrono::Utc;
use serde_json::Value;
use sqlx::{FromRow, PgPool};

use super::budgeting_dto::{
    BudgetDocumentResponse, BudgetListQuery, CreateAllocationDto, CreateBudgetPlanDto,
    CreateExpenseDto,
};
use super::budgeting_interfaces::IBudgetingRepo;
use crate::pkg::response::response_error::{AppError, db_error};

macro_rules! sql {
    ($($arg:tt)*) => {
        sqlx::AssertSqlSafe(format!($($arg)*))
    };
}

pub struct BudgetingRepo {
    pool: PgPool,
}

impl BudgetingRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(Debug, FromRow)]
struct ExpenseHeaderRow {
    document_number: String,
    document_date: chrono::NaiveDate,
    subtotal: f64,
    tax_amount: f64,
    grand_total: f64,
    bank_account_id: Option<i64>,
    status: String,
    submitted_by: Option<i64>,
}

#[derive(Debug, FromRow)]
struct ExpenseLineRow {
    coa_id: i64,
    description: Option<String>,
    amount: f64,
    tax_amount: f64,
    total: f64,
    budget_allocation_id: Option<i64>,
}

#[async_trait::async_trait]
impl IBudgetingRepo for BudgetingRepo {
    async fn list_budgets(&self, query: &BudgetListQuery) -> Result<(Vec<Value>, u64), AppError> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(20).clamp(1, 100);
        let offset = (page - 1) * limit;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM budget_plan
             WHERE ($1::text IS NULL OR budget_number ILIKE '%' || $1 || '%' OR name ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR status = $2)",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .fetch_one(&self.pool)
        .await
        .map_err(db_error)?;

        let rows: Vec<Value> = sqlx::query_scalar(
            "SELECT to_jsonb(t) || jsonb_build_object(
                        'department_name', d.name,
                        'department_code', d.code
                    )
             FROM budget_plan t
             LEFT JOIN masterdata_department d ON d.id = t.department_id
             WHERE ($1::text IS NULL OR t.budget_number ILIKE '%' || $1 || '%' OR t.name ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR t.status = $2)
             ORDER BY t.id DESC LIMIT $3 OFFSET $4",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(db_error)?;

        Ok((rows, total as u64))
    }

    async fn get_budget(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, AppError> {
        get_document(
            &self.pool,
            "budget_plan",
            "budget_plan_detail",
            "budget_plan_id",
            id,
        )
        .await
    }

    async fn create_budget(
        &self,
        number: &str,
        dto: &CreateBudgetPlanDto,
        total_amount: f64,
    ) -> Result<i64, AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;
        let root: String = sqlx::query_scalar(
            "SELECT 'ROOT-' || to_char($1::date, 'YYYYMMDD') || '-' ||
                    lpad(nextval('root_transaction_seq')::text, 6, '0')",
        )
        .bind(Utc::now().date_naive())
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

        let id: i64 = sqlx::query_scalar(
            "INSERT INTO budget_plan
             (budget_number, fiscal_year, name, department_id, total_amount, status, prepared_by, notes, root_transaction_id)
             VALUES ($1,$2,$3,$4,$5::numeric,'draft',$6,$7,$8)
             RETURNING id",
        )
        .bind(number)
        .bind(dto.fiscal_year)
        .bind(&dto.name)
        .bind(dto.department_id)
        .bind(total_amount)
        .bind(dto.prepared_by)
        .bind(&dto.notes)
        .bind(&root)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

        for (idx, line) in dto.lines.iter().enumerate() {
            sqlx::query(
                "INSERT INTO budget_plan_detail
                 (budget_plan_id, line_number, coa_id, department_id, description, allocated_amount, notes)
                 VALUES ($1,$2,$3,$4,$5,$6::numeric,$7)",
            )
            .bind(id)
            .bind((idx + 1) as i32)
            .bind(line.coa_id)
            .bind(line.department_id.or(dto.department_id))
            .bind(&line.description)
            .bind(line.allocated_amount)
            .bind(&line.notes)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;
        }

        tx.commit().await.map_err(db_error)?;
        Ok(id)
    }

    async fn update_budget(
        &self,
        id: i64,
        dto: &CreateBudgetPlanDto,
        total_amount: f64,
    ) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;

        let status: Option<String> =
            sqlx::query_scalar("SELECT status FROM budget_plan WHERE id = $1 FOR UPDATE")
                .bind(id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db_error)?;
        let status = status.ok_or_else(|| AppError::NotFound("Budget plan not found".into()))?;
        if status != "draft" && status != "rejected" {
            return Err(AppError::Conflict(
                "Only draft or rejected budget plans can be edited".to_string(),
            ));
        }

        sqlx::query(
            "UPDATE budget_plan
             SET fiscal_year = $2, name = $3, department_id = $4, total_amount = $5::numeric,
                 notes = $6, prepared_by = COALESCE($7, prepared_by), updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(dto.fiscal_year)
        .bind(&dto.name)
        .bind(dto.department_id)
        .bind(total_amount)
        .bind(&dto.notes)
        .bind(dto.prepared_by)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        if !dto.lines.is_empty() {
            sqlx::query("DELETE FROM budget_plan_detail WHERE budget_plan_id = $1")
                .bind(id)
                .execute(&mut *tx)
                .await
                .map_err(db_error)?;

            for (idx, line) in dto.lines.iter().enumerate() {
                sqlx::query(
                    "INSERT INTO budget_plan_detail
                     (budget_plan_id, line_number, coa_id, department_id, description, allocated_amount, notes)
                     VALUES ($1,$2,$3,$4,$5,$6::numeric,$7)",
                )
                .bind(id)
                .bind((idx + 1) as i32)
                .bind(line.coa_id)
                .bind(line.department_id.or(dto.department_id))
                .bind(&line.description)
                .bind(line.allocated_amount)
                .bind(&line.notes)
                .execute(&mut *tx)
                .await
                .map_err(db_error)?;
            }
        }

        tx.commit().await.map_err(db_error)?;
        Ok(())
    }

    async fn delete_budget(&self, id: i64) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;
        let status: Option<String> =
            sqlx::query_scalar("SELECT status FROM budget_plan WHERE id = $1 FOR UPDATE")
                .bind(id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db_error)?;
        let status = status.ok_or_else(|| AppError::NotFound("Budget plan not found".into()))?;
        if status != "draft" && status != "rejected" {
            return Err(AppError::Conflict(
                "Only draft or rejected budget plans can be deleted".to_string(),
            ));
        }

        let references: i64 = sqlx::query_scalar(
            "SELECT (SELECT COUNT(*) FROM budget_allocation WHERE budget_plan_id = $1)
                  + (SELECT COUNT(*) FROM accounting_expense WHERE budget_plan_id = $1)",
        )
        .bind(id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;
        if references > 0 {
            return Err(AppError::Conflict(
                "Budget plan is still referenced by an allocation or expense".to_string(),
            ));
        }

        sqlx::query("DELETE FROM budget_plan WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;
        tx.commit().await.map_err(db_error)?;
        Ok(())
    }

    async fn set_budget_status(
        &self,
        id: i64,
        status: &str,
        actor_id: Option<i64>,
        reason: Option<&str>,
    ) -> Result<(), AppError> {
        let updated = sqlx::query(
            "UPDATE budget_plan
             SET status = $2,
                 approved_by = CASE WHEN $2 = 'approved' THEN $3 ELSE approved_by END,
                 approved_at = CASE WHEN $2 = 'approved' THEN now() ELSE approved_at END,
                 notes = CASE WHEN $2 = 'rejected' AND $4::text IS NOT NULL
                              THEN COALESCE(notes || E'\\n', '') || 'Rejected: ' || $4
                              ELSE notes END,
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(status)
        .bind(actor_id)
        .bind(reason)
        .execute(&self.pool)
        .await
        .map_err(db_error)?;

        if updated.rows_affected() == 0 {
            return Err(AppError::NotFound("Budget plan not found".into()));
        }
        Ok(())
    }

    async fn approve_budget(&self, id: i64, actor_id: Option<i64>) -> Result<(), AppError> {
        self.set_budget_status(id, "approved", actor_id, None).await
    }

    async fn list_allocations(
        &self,
        query: &BudgetListQuery,
    ) -> Result<(Vec<Value>, u64), AppError> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(20).clamp(1, 100);
        let offset = (page - 1) * limit;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM budget_allocation_detail bad
             JOIN budget_allocation ba ON ba.id = bad.budget_allocation_id
             WHERE ($1::text IS NULL OR ba.allocation_number ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR ba.status = $2)",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .fetch_one(&self.pool)
        .await
        .map_err(db_error)?;

        let rows: Vec<Value> = sqlx::query_scalar(
            "SELECT to_jsonb(bad) || jsonb_build_object(
                        'allocation_id', ba.id,
                        'allocation_number', ba.allocation_number,
                        'budget_plan_id', ba.budget_plan_id,
                        'budget_number', bp.budget_number,
                        'fiscal_year', bp.fiscal_year,
                        'allocation_date', ba.allocation_date,
                        'status', ba.status,
                        'root_transaction_id', ba.root_transaction_id,
                        'department_name', d.name,
                        'department_code', d.code,
                        'account_code', c.account_code,
                        'account_name', c.account_name
                    )
             FROM budget_allocation_detail bad
             JOIN budget_allocation ba ON ba.id = bad.budget_allocation_id
             JOIN budget_plan bp ON bp.id = ba.budget_plan_id
             LEFT JOIN masterdata_department d ON d.id = COALESCE(bad.department_id, bp.department_id)
             LEFT JOIN masterdata_coa c ON c.id = bad.coa_id
             WHERE ($1::text IS NULL OR ba.allocation_number ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR ba.status = $2)
             ORDER BY bad.id DESC LIMIT $3 OFFSET $4",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(db_error)?;

        Ok((rows, total as u64))
    }

    async fn get_allocation(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, AppError> {
        get_document(
            &self.pool,
            "budget_allocation",
            "budget_allocation_detail",
            "budget_allocation_id",
            id,
        )
        .await
    }

    async fn create_allocation(
        &self,
        number: &str,
        dto: &CreateAllocationDto,
    ) -> Result<i64, AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;

        let plan: Option<(String, f64)> = sqlx::query_as(
            "SELECT root_transaction_id, total_amount::float8
             FROM budget_plan WHERE id = $1 FOR UPDATE",
        )
        .bind(dto.budget_plan_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db_error)?;
        let (root, plan_total) =
            plan.ok_or_else(|| AppError::NotFound("Budget plan not found".into()))?;

        let already_allocated: f64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(bad.allocated_amount), 0)::float8
             FROM budget_allocation_detail bad
             JOIN budget_allocation ba ON ba.id = bad.budget_allocation_id
             WHERE ba.budget_plan_id = $1 AND ba.status <> 'rejected'",
        )
        .bind(dto.budget_plan_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

        let requested = if dto.lines.is_empty() {
            sqlx::query_scalar::<_, f64>(
                "SELECT COALESCE(SUM(allocated_amount), 0)::float8
                 FROM budget_plan_detail WHERE budget_plan_id = $1",
            )
            .bind(dto.budget_plan_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(db_error)?
        } else {
            dto.lines.iter().map(|line| line.allocated_amount).sum()
        };

        if already_allocated + requested > plan_total + 0.0001 {
            return Err(AppError::BadRequest(format!(
                "Allocation total {} exceeds the remaining budget plan amount {}",
                requested,
                (plan_total - already_allocated).max(0.0)
            )));
        }

        let id: i64 = sqlx::query_scalar(
            "INSERT INTO budget_allocation
             (allocation_number, budget_plan_id, allocation_date, status, prepared_by, notes, root_transaction_id)
             VALUES ($1,$2,$3,'draft',$4,$5,$6)
             RETURNING id",
        )
        .bind(number)
        .bind(dto.budget_plan_id)
        .bind(dto.allocation_date)
        .bind(dto.prepared_by)
        .bind(&dto.notes)
        .bind(&root)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

        if dto.lines.is_empty() {
            sqlx::query(
                "INSERT INTO budget_allocation_detail
                 (budget_allocation_id, line_number, budget_plan_detail_id, coa_id, department_id, allocated_amount, used_amount, notes)
                 SELECT $1, ROW_NUMBER() OVER (ORDER BY id), id, coa_id, department_id, allocated_amount, 0, notes
                 FROM budget_plan_detail WHERE budget_plan_id = $2",
            )
            .bind(id)
            .bind(dto.budget_plan_id)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;
        } else {
            for (idx, line) in dto.lines.iter().enumerate() {
                sqlx::query(
                    "INSERT INTO budget_allocation_detail
                     (budget_allocation_id, line_number, budget_plan_detail_id, coa_id, department_id, allocated_amount, used_amount, notes)
                     VALUES ($1,$2,$3,$4,$5,$6::numeric,0,$7)",
                )
                .bind(id)
                .bind((idx + 1) as i32)
                .bind(line.budget_plan_detail_id)
                .bind(line.coa_id)
                .bind(line.department_id)
                .bind(line.allocated_amount)
                .bind(&line.notes)
                .execute(&mut *tx)
                .await
                .map_err(db_error)?;
            }
        }

        tx.commit().await.map_err(db_error)?;
        Ok(id)
    }

    async fn update_allocation(
        &self,
        id: i64,
        dto: &CreateAllocationDto,
    ) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;
        let status: Option<String> =
            sqlx::query_scalar("SELECT status FROM budget_allocation WHERE id = $1 FOR UPDATE")
                .bind(id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db_error)?;
        let status = status.ok_or_else(|| AppError::NotFound("Budget allocation not found".into()))?;
        if status != "draft" && status != "rejected" {
            return Err(AppError::Conflict(
                "Only draft or rejected allocations can be edited".to_string(),
            ));
        }

        sqlx::query(
            "UPDATE budget_allocation
             SET allocation_date = $2, notes = $3,
                 prepared_by = COALESCE($4, prepared_by), updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(dto.allocation_date)
        .bind(&dto.notes)
        .bind(dto.prepared_by)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        if !dto.lines.is_empty() {
            let used: f64 = sqlx::query_scalar(
                "SELECT COALESCE(SUM(used_amount), 0)::float8
                 FROM budget_allocation_detail WHERE budget_allocation_id = $1",
            )
            .bind(id)
            .fetch_one(&mut *tx)
            .await
            .map_err(db_error)?;
            if used > 0.0 {
                return Err(AppError::Conflict(
                    "Allocation already consumed by an expense and cannot be changed".to_string(),
                ));
            }

            sqlx::query("DELETE FROM budget_allocation_detail WHERE budget_allocation_id = $1")
                .bind(id)
                .execute(&mut *tx)
                .await
                .map_err(db_error)?;

            for (idx, line) in dto.lines.iter().enumerate() {
                sqlx::query(
                    "INSERT INTO budget_allocation_detail
                     (budget_allocation_id, line_number, budget_plan_detail_id, coa_id, department_id, allocated_amount, used_amount, notes)
                     VALUES ($1,$2,$3,$4,$5,$6::numeric,0,$7)",
                )
                .bind(id)
                .bind((idx + 1) as i32)
                .bind(line.budget_plan_detail_id)
                .bind(line.coa_id)
                .bind(line.department_id)
                .bind(line.allocated_amount)
                .bind(&line.notes)
                .execute(&mut *tx)
                .await
                .map_err(db_error)?;
            }
        }

        tx.commit().await.map_err(db_error)?;
        Ok(())
    }

    async fn delete_allocation(&self, id: i64) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;
        let status: Option<String> =
            sqlx::query_scalar("SELECT status FROM budget_allocation WHERE id = $1 FOR UPDATE")
                .bind(id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db_error)?;
        let status = status.ok_or_else(|| AppError::NotFound("Budget allocation not found".into()))?;
        if status != "draft" && status != "rejected" {
            return Err(AppError::Conflict(
                "Only draft or rejected allocations can be deleted".to_string(),
            ));
        }

        let used: f64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(used_amount), 0)::float8
             FROM budget_allocation_detail WHERE budget_allocation_id = $1",
        )
        .bind(id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;
        if used > 0.0 {
            return Err(AppError::Conflict(
                "Allocation already consumed by an expense and cannot be deleted".to_string(),
            ));
        }

        sqlx::query("DELETE FROM budget_allocation WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;
        tx.commit().await.map_err(db_error)?;
        Ok(())
    }

    async fn set_allocation_status(
        &self,
        id: i64,
        status: &str,
        actor_id: Option<i64>,
    ) -> Result<(), AppError> {
        let updated = sqlx::query(
            "UPDATE budget_allocation
             SET status = $2,
                 approved_by = CASE WHEN $2 = 'approved' THEN $3 ELSE approved_by END,
                 approved_at = CASE WHEN $2 = 'approved' THEN now() ELSE approved_at END,
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(status)
        .bind(actor_id)
        .execute(&self.pool)
        .await
        .map_err(db_error)?;
        if updated.rows_affected() == 0 {
            return Err(AppError::NotFound("Budget allocation not found".into()));
        }
        Ok(())
    }

    async fn approve_allocation(&self, id: i64, actor_id: Option<i64>) -> Result<(), AppError> {
        self.set_allocation_status(id, "approved", actor_id).await
    }

    async fn list_expenses(&self, query: &BudgetListQuery) -> Result<(Vec<Value>, u64), AppError> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(20).clamp(1, 100);
        let offset = (page - 1) * limit;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM accounting_expense
             WHERE ($1::text IS NULL OR document_number ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR status = $2)",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .fetch_one(&self.pool)
        .await
        .map_err(db_error)?;

        let rows: Vec<Value> = sqlx::query_scalar(
            "SELECT to_jsonb(t) || jsonb_build_object(
                        'department_name', d.name,
                        'department_code', d.code,
                        'budget_number', bp.budget_number,
                        'employee_name', e.name,
                        'supplier_name', s.company_name,
                        'account_code', ca.account_code,
                        'account_name', ca.account_name
                    )
             FROM accounting_expense t
             LEFT JOIN masterdata_department d ON d.id = t.department_id
             LEFT JOIN budget_plan bp ON bp.id = t.budget_plan_id
             LEFT JOIN masterdata_employee e ON e.id = t.employee_id
             LEFT JOIN masterdata_supplier s ON s.id = t.supplier_id
             LEFT JOIN LATERAL (
                 SELECT c.account_code, c.account_name
                 FROM accounting_expense_detail ed
                 JOIN masterdata_coa c ON c.id = ed.coa_id
                 WHERE ed.expense_id = t.id
                 ORDER BY ed.line_number
                 LIMIT 1
             ) ca ON true
             WHERE ($1::text IS NULL OR t.document_number ILIKE '%' || $1 || '%' OR t.description ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR t.status = $2)
             ORDER BY t.id DESC LIMIT $3 OFFSET $4",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(db_error)?;

        Ok((rows, total as u64))
    }

    async fn get_expense(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, AppError> {
        get_document(
            &self.pool,
            "accounting_expense",
            "accounting_expense_detail",
            "expense_id",
            id,
        )
        .await
    }

    async fn create_expense(
        &self,
        number: &str,
        dto: &CreateExpenseDto,
        subtotal: f64,
        tax_amount: f64,
        grand_total: f64,
    ) -> Result<i64, AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;
        let root: String = sqlx::query_scalar(
            "SELECT 'ROOT-' || to_char($1::date, 'YYYYMMDD') || '-' ||
                    lpad(nextval('root_transaction_seq')::text, 6, '0')",
        )
        .bind(dto.document_date)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

        let id: i64 = sqlx::query_scalar(
            "INSERT INTO accounting_expense
             (document_number, document_date, expense_type, category, department_id, cost_center_id,
              budget_plan_id, budget_allocation_id, employee_id, supplier_id, paid_to, payment_method,
              bank_account_id, description, subtotal, tax_amount, grand_total, status, notes,
              submitted_by, root_transaction_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::numeric,$16::numeric,$17::numeric,'draft',$18,$19,$20)
             RETURNING id",
        )
        .bind(number)
        .bind(dto.document_date)
        .bind(&dto.expense_type)
        .bind(&dto.category)
        .bind(dto.department_id)
        .bind(dto.cost_center_id)
        .bind(dto.budget_plan_id)
        .bind(dto.budget_allocation_id)
        .bind(dto.employee_id)
        .bind(dto.supplier_id)
        .bind(&dto.paid_to)
        .bind(normalize_payment_method(dto.payment_method.as_deref()))
        .bind(dto.bank_account_id)
        .bind(&dto.description)
        .bind(subtotal)
        .bind(tax_amount)
        .bind(grand_total)
        .bind(&dto.notes)
        .bind(dto.submitted_by.or(dto.prepared_by))
        .bind(&root)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

        insert_expense_lines(&mut tx, id, &dto.lines).await?;

        tx.commit().await.map_err(db_error)?;
        Ok(id)
    }

    async fn update_expense(
        &self,
        id: i64,
        dto: &CreateExpenseDto,
        subtotal: f64,
        tax_amount: f64,
        grand_total: f64,
    ) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;
        let status: Option<String> = sqlx::query_scalar(
            "SELECT status FROM accounting_expense WHERE id = $1 FOR UPDATE",
        )
        .bind(id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db_error)?;
        let status = status.ok_or_else(|| AppError::NotFound("Expense not found".into()))?;
        if status != "draft" && status != "rejected" && status != "created" {
            return Err(AppError::Conflict(
                "Only draft, created or rejected expenses can be edited".to_string(),
            ));
        }

        sqlx::query(
            "UPDATE accounting_expense
             SET document_date = $2, expense_type = $3, category = $4, department_id = $5,
                 cost_center_id = $6, budget_plan_id = $7, budget_allocation_id = $8,
                 employee_id = $9, supplier_id = $10, paid_to = $11, payment_method = $12,
                 bank_account_id = $13, description = $14, subtotal = $15::numeric,
                 tax_amount = $16::numeric, grand_total = $17::numeric, notes = $18,
                 submitted_by = COALESCE($19, submitted_by), updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(dto.document_date)
        .bind(&dto.expense_type)
        .bind(&dto.category)
        .bind(dto.department_id)
        .bind(dto.cost_center_id)
        .bind(dto.budget_plan_id)
        .bind(dto.budget_allocation_id)
        .bind(dto.employee_id)
        .bind(dto.supplier_id)
        .bind(&dto.paid_to)
        .bind(normalize_payment_method(dto.payment_method.as_deref()))
        .bind(dto.bank_account_id)
        .bind(&dto.description)
        .bind(subtotal)
        .bind(tax_amount)
        .bind(grand_total)
        .bind(&dto.notes)
        .bind(dto.submitted_by.or(dto.prepared_by))
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        sqlx::query("DELETE FROM accounting_expense_detail WHERE expense_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;
        insert_expense_lines(&mut tx, id, &dto.lines).await?;

        tx.commit().await.map_err(db_error)?;
        Ok(())
    }

    async fn delete_expense(&self, id: i64) -> Result<(), AppError> {
        let status: Option<String> =
            sqlx::query_scalar("SELECT status FROM accounting_expense WHERE id = $1")
                .bind(id)
                .fetch_optional(&self.pool)
                .await
                .map_err(db_error)?;
        let status = status.ok_or_else(|| AppError::NotFound("Expense not found".into()))?;
        if status == "completed" || status == "approved" {
            return Err(AppError::Conflict(
                "Approved or posted expenses cannot be deleted".to_string(),
            ));
        }

        sqlx::query("DELETE FROM accounting_expense WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(db_error)?;
        Ok(())
    }

    async fn set_expense_status(
        &self,
        id: i64,
        status: &str,
        actor_id: Option<i64>,
        reason: Option<&str>,
    ) -> Result<(), AppError> {
        let updated = sqlx::query(
            "UPDATE accounting_expense
             SET status = $2,
                 approved_by = CASE WHEN $2 = 'approved' THEN $3 ELSE approved_by END,
                 approved_at = CASE WHEN $2 = 'approved' THEN now() ELSE approved_at END,
                 notes = CASE WHEN $2 = 'rejected' AND $4::text IS NOT NULL
                              THEN COALESCE(notes || E'\\n', '') || 'Rejected: ' || $4
                              ELSE notes END,
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(status)
        .bind(actor_id)
        .bind(reason)
        .execute(&self.pool)
        .await
        .map_err(db_error)?;
        if updated.rows_affected() == 0 {
            return Err(AppError::NotFound("Expense not found".into()));
        }
        Ok(())
    }

    async fn approve_expense(&self, id: i64, actor_id: Option<i64>) -> Result<(), AppError> {
        self.set_expense_status(id, "approved", actor_id, None).await
    }

    async fn post_expense(&self, id: i64, actor_id: Option<i64>) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db_error)?;

        let header = sqlx::query_as::<_, ExpenseHeaderRow>(
            "SELECT document_number, document_date, subtotal::float8 AS subtotal,
                    tax_amount::float8 AS tax_amount, grand_total::float8 AS grand_total,
                    bank_account_id, status, submitted_by
             FROM accounting_expense WHERE id = $1 FOR UPDATE",
        )
        .bind(id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db_error)?
        .ok_or_else(|| AppError::NotFound("Expense not found".into()))?;

        if header.status == "completed" {
            return Err(AppError::Conflict("Expense is already posted".to_string()));
        }
        if header.status != "approved" && header.status != "created" {
            return Err(AppError::BadRequest(
                "Expense must be approved before posting".to_string(),
            ));
        }

        let lines = sqlx::query_as::<_, ExpenseLineRow>(
            "SELECT coa_id, description, amount::float8 AS amount,
                    tax_amount::float8 AS tax_amount, total::float8 AS total,
                    budget_allocation_id
             FROM accounting_expense_detail WHERE expense_id = $1 ORDER BY line_number",
        )
        .bind(id)
        .fetch_all(&mut *tx)
        .await
        .map_err(db_error)?;

        if lines.is_empty() {
            return Err(AppError::BadRequest(
                "Expense has no detail lines to post".to_string(),
            ));
        }

        // Consume budget atomically. The conditional update is what prevents
        // two concurrent postings from overspending the same allocation.
        for line in &lines {
            if let Some(allocation_id) = line.budget_allocation_id {
                let updated = sqlx::query(
                    "UPDATE budget_allocation_detail
                     SET used_amount = used_amount + $2::numeric
                     WHERE id = $1 AND allocated_amount - used_amount >= $2::numeric",
                )
                .bind(allocation_id)
                .bind(line.total)
                .execute(&mut *tx)
                .await
                .map_err(db_error)?;

                if updated.rows_affected() == 0 {
                    return Err(AppError::Conflict(format!(
                        "Budget allocation detail {allocation_id} does not have enough remaining budget"
                    )));
                }
            }
        }

        let period_id: Option<i64> = sqlx::query_scalar(
            "SELECT id FROM accounting_period
             WHERE $1::date BETWEEN start_date AND end_date AND status = 'open'
             ORDER BY start_date DESC LIMIT 1",
        )
        .bind(header.document_date)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db_error)?;

        let ap_id: i64 = sqlx::query_scalar("SELECT id FROM masterdata_coa WHERE account_code = '210'")
            .fetch_one(&mut *tx)
            .await
            .map_err(db_error)?;
        let input_vat_id: i64 =
            sqlx::query_scalar("SELECT id FROM masterdata_coa WHERE account_code = '211'")
                .fetch_one(&mut *tx)
                .await
                .map_err(db_error)?;

        let journal_number = format!(
            "JV/EXPENSE/{}/{}",
            header.document_date.format("%Y%m%d"),
            Utc::now().timestamp_nanos_opt().unwrap_or_default()
        );
        let actor = actor_id.or(header.submitted_by);
        let journal_id: i64 = sqlx::query_scalar(
            "INSERT INTO accounting_journal
             (journal_number, journal_date, journal_type, reference_type, reference_id, description,
              total_debit, total_credit, status, posted_by, posted_at, created_by, period_id)
             VALUES ($1,$2,'expense','expense',$3,$4,$5::numeric,$5::numeric,'completed',$6,now(),$6,$7)
             RETURNING id",
        )
        .bind(&journal_number)
        .bind(header.document_date)
        .bind(id)
        .bind(format!("Expense {}", header.document_number))
        .bind(header.grand_total)
        .bind(actor)
        .bind(period_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

        let mut line_number = 1i32;
        for line in &lines {
            sqlx::query(
                "INSERT INTO accounting_journal_detail
                 (journal_id, line_number, coa_id, description, debit, credit)
                 VALUES ($1,$2,$3,$4,$5::numeric,0)",
            )
            .bind(journal_id)
            .bind(line_number)
            .bind(line.coa_id)
            .bind(line.description.as_deref().unwrap_or("Expense"))
            .bind(line.amount)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;
            line_number += 1;
        }

        if header.tax_amount > 0.0 {
            sqlx::query(
                "INSERT INTO accounting_journal_detail
                 (journal_id, line_number, coa_id, description, debit, credit)
                 VALUES ($1,$2,$3,'Input VAT', $4::numeric, 0)",
            )
            .bind(journal_id)
            .bind(line_number)
            .bind(input_vat_id)
            .bind(header.tax_amount)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;
            line_number += 1;
        }

        sqlx::query(
            "INSERT INTO accounting_journal_detail
             (journal_id, line_number, coa_id, description, debit, credit)
             VALUES ($1,$2,$3,'Accrued payable',0,$4::numeric)",
        )
        .bind(journal_id)
        .bind(line_number)
        .bind(ap_id)
        .bind(header.grand_total)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        sqlx::query(
            "UPDATE accounting_expense
             SET status = 'completed', journal_id = $2, posted_by = $3,
                 posted_at = now(), updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(journal_id)
        .bind(actor)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        tx.commit().await.map_err(db_error)?;
        Ok(())
    }

    async fn budget_vs_actual(&self) -> Result<Value, AppError> {
        sqlx::query_scalar(
            "SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM report_budget_vs_actual t",
        )
        .fetch_one(&self.pool)
        .await
        .map_err(db_error)
    }

    async fn next_number(&self, prefix: &str) -> Result<String, AppError> {
        Ok(format!(
            "{}/{}/{}",
            prefix,
            Utc::now().format("%Y%m%d"),
            Utc::now().timestamp_millis()
        ))
    }

    async fn allocation_detail_remaining(&self, id: i64) -> Result<f64, AppError> {
        let remaining = sqlx::query_scalar::<_, f64>(
            "SELECT (allocated_amount - used_amount)::float8 FROM budget_allocation_detail WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(db_error)?
        .ok_or_else(|| AppError::NotFound(format!("Budget allocation detail {id} not found")))?;
        Ok(remaining)
    }
}

fn normalize_payment_method(value: Option<&str>) -> &str {
    match value.map(|value| value.trim().to_ascii_lowercase()) {
        Some(value) if value == "cash" => "cash",
        Some(value) if value == "check" || value == "cheque" => "check",
        Some(value) if value == "transfer" || value == "bank transfer" || value == "bank_transfer" => {
            "transfer"
        }
        Some(_) => "transfer",
        None => "transfer",
    }
}

async fn insert_expense_lines(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    id: i64,
    lines: &[super::budgeting_dto::ExpenseLineDto],
) -> Result<(), AppError> {
    for (idx, line) in lines.iter().enumerate() {
        let tax = line.tax_amount.unwrap_or(0.0);
        let total = line.amount + tax;
        sqlx::query(
            "INSERT INTO accounting_expense_detail
             (expense_id, line_number, coa_id, description, amount, tax_rate_id, tax_amount, total, budget_allocation_id)
             VALUES ($1,$2,$3,$4,$5::numeric,$6,$7::numeric,$8::numeric,$9)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.coa_id)
        .bind(&line.description)
        .bind(line.amount)
        .bind(line.tax_rate_id)
        .bind(tax)
        .bind(total)
        .bind(line.budget_allocation_id)
        .execute(&mut **tx)
        .await
        .map_err(db_error)?;
    }
    Ok(())
}

async fn get_document(
    pool: &PgPool,
    table: &str,
    detail_table: &str,
    fk: &str,
    id: i64,
) -> Result<Option<BudgetDocumentResponse>, AppError> {
    let header: Option<Value> =
        sqlx::query_scalar(sql!("SELECT to_jsonb(t) FROM {table} t WHERE t.id = $1"))
            .bind(id)
            .fetch_optional(pool)
            .await
            .map_err(db_error)?;

    let Some(header) = header else {
        return Ok(None);
    };

    let lines: Vec<Value> = sqlx::query_scalar(sql!(
        "SELECT to_jsonb(t) FROM {detail_table} t WHERE t.{fkey} = $1 ORDER BY t.line_number",
        fkey = fk
    ))
    .bind(id)
    .fetch_all(pool)
    .await
    .map_err(db_error)?;

    Ok(Some(BudgetDocumentResponse { header, lines }))
}
