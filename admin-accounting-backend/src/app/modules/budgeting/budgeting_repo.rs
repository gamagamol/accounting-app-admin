use chrono::Utc;
use serde_json::Value;
use sqlx::{FromRow, PgPool};

use super::budgeting_dto::{
    BudgetDocumentResponse, BudgetListQuery, CreateAllocationDto, CreateBudgetPlanDto,
    CreateExpenseDto,
};
use super::budgeting_interfaces::IBudgetingRepo;

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
    grand_total: f64,
    bank_account_id: Option<i64>,
    status: String,
    submitted_by: Option<i64>,
}

#[derive(Debug, FromRow)]
struct ExpenseLineRow {
    coa_id: i64,
    total: f64,
    budget_allocation_id: Option<i64>,
}

#[async_trait::async_trait]
impl IBudgetingRepo for BudgetingRepo {
    async fn list_budgets(&self, query: &BudgetListQuery) -> Result<(Vec<Value>, u64), String> {
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
        .map_err(|e| e.to_string())?;

        let rows: Vec<Value> = sqlx::query_scalar(
            "SELECT to_jsonb(t) FROM budget_plan t
             WHERE ($1::text IS NULL OR budget_number ILIKE '%' || $1 || '%' OR name ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR status = $2)
             ORDER BY id DESC LIMIT $3 OFFSET $4",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok((rows, total as u64))
    }

    async fn get_budget(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, String> {
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
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id: i64 = sqlx::query_scalar(
            "INSERT INTO budget_plan
             (budget_number, fiscal_year, name, department_id, total_amount, status, prepared_by, notes)
             VALUES ($1,$2,$3,$4,$5::numeric,'draft',$6,$7)
             RETURNING id",
        )
        .bind(number)
        .bind(dto.fiscal_year)
        .bind(&dto.name)
        .bind(dto.department_id)
        .bind(total_amount)
        .bind(dto.prepared_by)
        .bind(&dto.notes)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

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
            .map_err(|e| e.to_string())?;
        }

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn approve_budget(&self, id: i64, actor_id: Option<i64>) -> Result<(), String> {
        sqlx::query(
            "UPDATE budget_plan
             SET status = 'approved', approved_by = $2, approved_at = now(), updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(actor_id)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    async fn list_allocations(&self, query: &BudgetListQuery) -> Result<(Vec<Value>, u64), String> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(20).clamp(1, 100);
        let offset = (page - 1) * limit;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM budget_allocation
             WHERE ($1::text IS NULL OR allocation_number ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR status = $2)",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        let rows: Vec<Value> = sqlx::query_scalar(
            "SELECT to_jsonb(t) FROM budget_allocation t
             WHERE ($1::text IS NULL OR allocation_number ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR status = $2)
             ORDER BY id DESC LIMIT $3 OFFSET $4",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok((rows, total as u64))
    }

    async fn get_allocation(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, String> {
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
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id: i64 = sqlx::query_scalar(
            "INSERT INTO budget_allocation
             (allocation_number, budget_plan_id, allocation_date, status, prepared_by, notes)
             VALUES ($1,$2,$3,'draft',$4,$5)
             RETURNING id",
        )
        .bind(number)
        .bind(dto.budget_plan_id)
        .bind(dto.allocation_date)
        .bind(dto.prepared_by)
        .bind(&dto.notes)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

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
            .map_err(|e| e.to_string())?;
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
                .map_err(|e| e.to_string())?;
            }
        }

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn approve_allocation(&self, id: i64, actor_id: Option<i64>) -> Result<(), String> {
        sqlx::query(
            "UPDATE budget_allocation
             SET status = 'approved', approved_by = $2, approved_at = now(), updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(actor_id)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    async fn list_expenses(&self, query: &BudgetListQuery) -> Result<(Vec<Value>, u64), String> {
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
        .map_err(|e| e.to_string())?;

        let rows: Vec<Value> = sqlx::query_scalar(
            "SELECT to_jsonb(t) FROM accounting_expense t
             WHERE ($1::text IS NULL OR document_number ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR status = $2)
             ORDER BY id DESC LIMIT $3 OFFSET $4",
        )
        .bind(query.search.as_deref())
        .bind(query.status.as_deref())
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok((rows, total as u64))
    }

    async fn get_expense(&self, id: i64) -> Result<Option<BudgetDocumentResponse>, String> {
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
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id: i64 = sqlx::query_scalar(
            "INSERT INTO accounting_expense
             (document_number, document_date, expense_type, category, department_id, cost_center_id,
              budget_plan_id, budget_allocation_id, employee_id, supplier_id, paid_to, payment_method,
              bank_account_id, description, subtotal, tax_amount, grand_total, status, notes, submitted_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::numeric,$16::numeric,$17::numeric,'draft',$18,$19)
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
        .bind(dto.payment_method.as_deref().unwrap_or("transfer"))
        .bind(dto.bank_account_id)
        .bind(&dto.description)
        .bind(subtotal)
        .bind(tax_amount)
        .bind(grand_total)
        .bind(&dto.notes)
        .bind(dto.prepared_by)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        for (idx, line) in dto.lines.iter().enumerate() {
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
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
        }

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn approve_expense(&self, id: i64, actor_id: Option<i64>) -> Result<(), String> {
        sqlx::query(
            "UPDATE accounting_expense
             SET status = 'approved', approved_by = $2, approved_at = now(), updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(actor_id)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    async fn post_expense(&self, id: i64, actor_id: Option<i64>) -> Result<(), String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;

        let header = sqlx::query_as::<_, ExpenseHeaderRow>(
            "SELECT document_number, document_date, grand_total::float8 AS grand_total,
                    bank_account_id, status, submitted_by
             FROM accounting_expense WHERE id = $1 FOR UPDATE",
        )
        .bind(id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "expense not found".to_string())?;

        if header.status != "approved" && header.status != "created" {
            return Err("expense must be approved before posting".to_string());
        }

        let lines = sqlx::query_as::<_, ExpenseLineRow>(
            "SELECT coa_id, total::float8 AS total, budget_allocation_id
             FROM accounting_expense_detail WHERE expense_id = $1 ORDER BY line_number",
        )
        .bind(id)
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        let mut journal_lines = Vec::new();
        for line in &lines {
            if let Some(allocation_id) = line.budget_allocation_id {
                let remaining = sqlx::query_scalar::<_, f64>(
                    "SELECT (allocated_amount - used_amount)::float8
                     FROM budget_allocation_detail WHERE id = $1 FOR UPDATE",
                )
                .bind(allocation_id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(|e| e.to_string())?
                .unwrap_or(0.0);

                if remaining + 0.0001 < line.total {
                    return Err(format!(
                        "budget allocation detail {allocation_id} has insufficient remaining budget"
                    ));
                }
            }
            journal_lines.push((line.coa_id, line.total));
        }

        let bank_coa_id = match header.bank_account_id {
            Some(bank_id) => sqlx::query_scalar::<_, i64>(
                "SELECT coa_id FROM masterdata_bank_account WHERE id = $1",
            )
            .bind(bank_id)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| e.to_string())?
            .unwrap_or(26),
            None => 26,
        };

        let journal_number = format!(
            "JV/EXPENSE/{}/{}",
            header.document_date.format("%Y%m%d"),
            Utc::now().timestamp_nanos_opt().unwrap_or_default()
        );
        let journal_id: i64 = sqlx::query_scalar(
            "INSERT INTO accounting_journal
             (journal_number, journal_date, journal_type, reference_type, reference_id, description,
              total_debit, total_credit, status, posted_by, posted_at, created_by)
             VALUES ($1,$2,'expense','expense',$3,$4,$5::numeric,$5::numeric,'completed',$6,now(),$6)
             RETURNING id",
        )
        .bind(&journal_number)
        .bind(header.document_date)
        .bind(id)
        .bind(format!("Expense {}", header.document_number))
        .bind(header.grand_total)
        .bind(actor_id.or(header.submitted_by))
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        for (idx, (coa_id, amount)) in journal_lines.iter().enumerate() {
            sqlx::query(
                "INSERT INTO accounting_journal_detail
                 (journal_id, line_number, coa_id, description, debit, credit)
                 VALUES ($1,$2,$3,'Expense', $4::numeric, 0)",
            )
            .bind(journal_id)
            .bind((idx + 1) as i32)
            .bind(coa_id)
            .bind(amount)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
        }

        sqlx::query(
            "INSERT INTO accounting_journal_detail
             (journal_id, line_number, coa_id, description, debit, credit)
             VALUES ($1,$2,$3,'Cash / bank',0,$4::numeric)",
        )
        .bind(journal_id)
        .bind((journal_lines.len() + 1) as i32)
        .bind(bank_coa_id)
        .bind(header.grand_total)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        for line in &lines {
            if let Some(allocation_id) = line.budget_allocation_id {
                sqlx::query(
                    "UPDATE budget_allocation_detail
                     SET used_amount = used_amount + $2::numeric
                     WHERE id = $1",
                )
                .bind(allocation_id)
                .bind(line.total)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
            }
        }

        sqlx::query(
            "UPDATE accounting_expense
             SET status = 'completed', journal_id = $2, posted_by = $3, posted_at = now(), updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(journal_id)
        .bind(actor_id.or(header.submitted_by))
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(())
    }

    async fn budget_vs_actual(&self) -> Result<Value, String> {
        sqlx::query_scalar(
            "SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM report_budget_vs_actual t",
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.to_string())
    }

    async fn next_number(&self, prefix: &str) -> Result<String, String> {
        Ok(format!(
            "{}/{}/{}",
            prefix,
            Utc::now().format("%Y%m%d"),
            Utc::now().timestamp_millis()
        ))
    }

    async fn allocation_detail_remaining(&self, id: i64) -> Result<f64, String> {
        let remaining = sqlx::query_scalar::<_, f64>(
            "SELECT (allocated_amount - used_amount)::float8 FROM budget_allocation_detail WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("budget allocation detail {id} not found"))?;
        Ok(remaining)
    }
}

async fn get_document(
    pool: &PgPool,
    table: &str,
    detail_table: &str,
    fk: &str,
    id: i64,
) -> Result<Option<BudgetDocumentResponse>, String> {
    let header: Option<Value> =
        sqlx::query_scalar(sql!("SELECT to_jsonb(t) FROM {table} t WHERE t.id = $1"))
            .bind(id)
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())?;

    let Some(header) = header else {
        return Ok(None);
    };

    let lines: Vec<Value> = sqlx::query_scalar(sql!(
        "SELECT to_jsonb(t) FROM {detail_table} t WHERE t.{fk} = $1 ORDER BY t.line_number"
    ))
    .bind(id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Some(BudgetDocumentResponse { header, lines }))
}
