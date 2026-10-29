use chrono::{NaiveDate, Utc};
use serde_json::Value;
use sqlx::PgPool;

use super::journal_dto::{CreateJournalDto, JournalListQuery};
use super::journal_interfaces::IJournalRepo;

pub struct JournalRepo {
    pool: PgPool,
}

impl JournalRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait::async_trait]
impl IJournalRepo for JournalRepo {
    async fn list(&self, query: &JournalListQuery) -> Result<(Value, u64), String> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(50).clamp(1, 500);
        let offset = ((page - 1) * limit) as i64;
        let search = query
            .search
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty());
        let status = query
            .status
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty());
        let period = query
            .period
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty());

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*)
             FROM accounting_journal j
             WHERE ($1::text IS NULL OR j.journal_number ILIKE '%' || $1 || '%'
                    OR COALESCE(j.description, '') ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR j.status = $2)
               AND ($3::text IS NULL OR to_char(j.journal_date, 'YYYY-MM') = $3 OR to_char(j.journal_date, 'YYYY') = $3)",
        )
        .bind(search)
        .bind(status)
        .bind(period)
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        let rows: Value = sqlx::query_scalar(
            "SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.journal_date DESC, t.id DESC), '[]'::jsonb)
             FROM (
                 SELECT j.id,
                        j.journal_number,
                        j.journal_date,
                        j.journal_type,
                        j.reference_type,
                        j.reference_id,
                        j.description,
                        j.total_debit::float8 AS total_debit,
                        j.total_credit::float8 AS total_credit,
                        j.status,
                        j.posted_by,
                        j.posted_at,
                        j.created_by,
                        j.created_at,
                        j.updated_at,
                        (SELECT COUNT(*) FROM accounting_journal_detail d WHERE d.journal_id = j.id) AS line_count
                 FROM accounting_journal j
                 WHERE ($1::text IS NULL OR j.journal_number ILIKE '%' || $1 || '%'
                        OR COALESCE(j.description, '') ILIKE '%' || $1 || '%')
                   AND ($2::text IS NULL OR j.status = $2)
                   AND ($3::text IS NULL OR to_char(j.journal_date, 'YYYY-MM') = $3 OR to_char(j.journal_date, 'YYYY') = $3)
                 ORDER BY j.journal_date DESC, j.id DESC
                 LIMIT $4 OFFSET $5
             ) t",
        )
        .bind(search)
        .bind(status)
        .bind(period)
        .bind(limit as i64)
        .bind(offset)
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        Ok((rows, total as u64))
    }

    async fn get(&self, id: i64) -> Result<Option<Value>, String> {
        let header: Option<Value> = sqlx::query_scalar(
            "SELECT to_jsonb(t)
             FROM (
                 SELECT j.id,
                        j.journal_number,
                        j.journal_date,
                        j.journal_type,
                        j.reference_type,
                        j.reference_id,
                        j.description,
                        j.total_debit::float8 AS total_debit,
                        j.total_credit::float8 AS total_credit,
                        j.status,
                        j.posted_by,
                        j.posted_at,
                        j.created_by,
                        j.created_at,
                        j.updated_at
                 FROM accounting_journal j
                 WHERE j.id = $1
             ) t",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        let Some(header) = header else {
            return Ok(None);
        };

        let lines: Value = sqlx::query_scalar(
            "SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.line_number), '[]'::jsonb)
             FROM (
                 SELECT d.id,
                        d.line_number,
                        d.coa_id,
                        c.account_code,
                        c.account_name,
                        c.account_type,
                        d.description,
                        d.debit::float8 AS debit,
                        d.credit::float8 AS credit,
                        d.department_id,
                        d.cost_center_id,
                        d.employee_id,
                        d.tax_rate_id
                 FROM accounting_journal_detail d
                 JOIN masterdata_coa c ON c.id = d.coa_id
                 WHERE d.journal_id = $1
             ) t",
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        Ok(Some(serde_json::json!({
            "header": header,
            "lines": lines,
        })))
    }

    async fn status(&self, id: i64) -> Result<Option<String>, String> {
        sqlx::query_scalar("SELECT status FROM accounting_journal WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|error| error.to_string())
    }

    async fn next_number(&self, date: NaiveDate) -> Result<String, String> {
        let suffix = Utc::now()
            .timestamp_nanos_opt()
            .unwrap_or_else(|| Utc::now().timestamp_millis());
        Ok(format!("MJ/{}/{}", date.format("%Y%m%d"), suffix))
    }

    async fn create(
        &self,
        journal_number: &str,
        dto: &CreateJournalDto,
        total_debit: f64,
        total_credit: f64,
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|error| error.to_string())?;

        let id: i64 = sqlx::query_scalar(
            "INSERT INTO accounting_journal
                (journal_number, journal_date, journal_type, reference_type, reference_id,
                 description, total_debit, total_credit, status, created_by, updated_at)
             VALUES ($1, $2, 'manual', $3, $4, $5, $6::numeric, $7::numeric, 'draft', $8, now())
             RETURNING id",
        )
        .bind(journal_number)
        .bind(dto.journal_date)
        .bind(dto.reference_type.as_deref())
        .bind(dto.reference_id)
        .bind(dto.description.as_deref())
        .bind(total_debit)
        .bind(total_credit)
        .bind(dto.created_by)
        .fetch_one(&mut *tx)
        .await
        .map_err(|error| error.to_string())?;

        for (index, line) in dto.lines.iter().enumerate() {
            sqlx::query(
                "INSERT INTO accounting_journal_detail
                    (journal_id, line_number, coa_id, description, debit, credit,
                     department_id, cost_center_id, employee_id, tax_rate_id)
                 VALUES ($1, $2, $3, $4, $5::numeric, $6::numeric, $7, $8, $9, $10)",
            )
            .bind(id)
            .bind((index + 1) as i32)
            .bind(line.coa_id)
            .bind(line.description.as_deref())
            .bind(line.debit)
            .bind(line.credit)
            .bind(line.department_id)
            .bind(line.cost_center_id)
            .bind(line.employee_id)
            .bind(line.tax_rate_id)
            .execute(&mut *tx)
            .await
            .map_err(|error| error.to_string())?;
        }

        tx.commit().await.map_err(|error| error.to_string())?;
        Ok(id)
    }

    async fn update(
        &self,
        id: i64,
        dto: &CreateJournalDto,
        total_debit: f64,
        total_credit: f64,
    ) -> Result<(), String> {
        let mut tx = self.pool.begin().await.map_err(|error| error.to_string())?;

        sqlx::query(
            "UPDATE accounting_journal
             SET journal_date = $2,
                 reference_type = $3,
                 reference_id = $4,
                 description = $5,
                 total_debit = $6::numeric,
                 total_credit = $7::numeric,
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(dto.journal_date)
        .bind(dto.reference_type.as_deref())
        .bind(dto.reference_id)
        .bind(dto.description.as_deref())
        .bind(total_debit)
        .bind(total_credit)
        .execute(&mut *tx)
        .await
        .map_err(|error| error.to_string())?;

        sqlx::query("DELETE FROM accounting_journal_detail WHERE journal_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|error| error.to_string())?;

        for (index, line) in dto.lines.iter().enumerate() {
            sqlx::query(
                "INSERT INTO accounting_journal_detail
                    (journal_id, line_number, coa_id, description, debit, credit,
                     department_id, cost_center_id, employee_id, tax_rate_id)
                 VALUES ($1, $2, $3, $4, $5::numeric, $6::numeric, $7, $8, $9, $10)",
            )
            .bind(id)
            .bind((index + 1) as i32)
            .bind(line.coa_id)
            .bind(line.description.as_deref())
            .bind(line.debit)
            .bind(line.credit)
            .bind(line.department_id)
            .bind(line.cost_center_id)
            .bind(line.employee_id)
            .bind(line.tax_rate_id)
            .execute(&mut *tx)
            .await
            .map_err(|error| error.to_string())?;
        }

        tx.commit().await.map_err(|error| error.to_string())?;
        Ok(())
    }

    async fn delete(&self, id: i64) -> Result<bool, String> {
        let result = sqlx::query("DELETE FROM accounting_journal WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|error| error.to_string())?;
        Ok(result.rows_affected() > 0)
    }

    async fn post(&self, id: i64, actor_id: Option<i64>) -> Result<(), String> {
        sqlx::query(
            "UPDATE accounting_journal
             SET status = 'completed',
                 posted_by = $2,
                 posted_at = now(),
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(actor_id)
        .execute(&self.pool)
        .await
        .map_err(|error| error.to_string())?;
        Ok(())
    }

    async fn unpost(&self, id: i64) -> Result<(), String> {
        sqlx::query(
            "UPDATE accounting_journal
             SET status = 'draft',
                 posted_by = NULL,
                 posted_at = NULL,
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|error| error.to_string())?;
        Ok(())
    }

    async fn period_is_locked(&self, date: NaiveDate) -> Result<bool, String> {
        sqlx::query_scalar(
            "SELECT EXISTS(
                 SELECT 1 FROM report_lock
                 WHERE period = to_char($1::date, 'YYYY-MM')
             )",
        )
        .bind(date)
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())
    }
}
