use async_trait::async_trait;
use chrono::{NaiveDate, Utc};
use serde_json::Value;
use sqlx::PgPool;

use super::period_dto::{CreatePeriodDto, ListPeriodsQuery, PeriodActionDto, UpdatePeriodDto};
use super::period_interfaces::IPeriodRepo;
use crate::pkg::response::response_error::AppError;

pub struct PeriodRepo {
    pool: PgPool,
}

#[derive(Debug, sqlx::FromRow)]
struct PeriodRow {
    period_code: String,
    start_date: NaiveDate,
    end_date: NaiveDate,
    status: String,
    closed_by: Option<i64>,
    notes: Option<String>,
}

impl PeriodRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    async fn fetch_row<'e, E>(executor: E, id: i64) -> Result<Option<PeriodRow>, AppError>
    where
        E: sqlx::Executor<'e, Database = sqlx::Postgres>,
    {
        sqlx::query_as::<_, PeriodRow>(
            "SELECT period_code, start_date, end_date, status, closed_by, notes
             FROM accounting_period
             WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(executor)
        .await
        .map_err(db_error)
    }

    fn normalize_period_code(value: Option<String>, start: NaiveDate) -> Result<String, AppError> {
        let code = value
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| start.format("%Y-%m").to_string());

        let parts: Vec<&str> = code.split('-').collect();
        let valid = parts.len() == 2
            && parts[0].len() == 4
            && parts[1].len() == 2
            && parts[0].parse::<i32>().is_ok()
            && parts[1]
                .parse::<u32>()
                .map(|month| (1..=12).contains(&month))
                .unwrap_or(false);

        if !valid {
            return Err(AppError::BadRequest(
                "period must use the YYYY-MM format".into(),
            ));
        }

        Ok(code)
    }

    fn normalize_status(value: Option<String>, fallback: &str) -> Result<String, AppError> {
        let status = value
            .map(|value| value.trim().to_ascii_lowercase())
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| fallback.to_string());

        if !matches!(status.as_str(), "open" | "closed") {
            return Err(AppError::BadRequest(
                "status must be either open or closed".into(),
            ));
        }

        Ok(status)
    }

    fn normalize_notes(value: Option<String>) -> Option<String> {
        value.and_then(|value| {
            let value = value.trim().to_string();
            if value.is_empty() { None } else { Some(value) }
        })
    }

    async fn reload(&self, id: i64) -> Result<Value, AppError> {
        self.get(id)
            .await?
            .ok_or_else(|| AppError::NotFound("accounting period not found".into()))
    }
}

#[async_trait]
impl IPeriodRepo for PeriodRepo {
    async fn list(&self, query: &ListPeriodsQuery) -> Result<Vec<Value>, AppError> {
        let search = query
            .search
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty());

        let rows: Value = sqlx::query_scalar(
            "SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.\"startDate\" DESC, t.id DESC), '[]'::jsonb)
             FROM (
                 SELECT p.id,
                        p.period_code AS \"period\",
                        p.start_date AS \"startDate\",
                        p.end_date AS \"endDate\",
                        p.status,
                        p.closed_by AS \"closedById\",
                        COALESCE(u.name, '') AS \"closedBy\",
                        p.closed_at AS \"closedAt\",
                        COALESCE(p.notes, '') AS notes,
                        c.id AS \"closingId\",
                        COALESCE(c.document_number, '') AS \"documentNumber\",
                        COALESCE(c.status, p.status) AS \"closingStatus\",
                        EXTRACT(YEAR FROM p.start_date)::int AS \"fiscalYear\",
                        p.created_at AS \"createdAt\",
                        p.updated_at AS \"updatedAt\"
                 FROM accounting_period p
                 LEFT JOIN accounting_period_closing c ON c.period_id = p.id
                 LEFT JOIN masterdata_user u ON u.id = p.closed_by
                 WHERE ($1::text IS NULL
                        OR p.period_code ILIKE '%' || $1 || '%'
                        OR COALESCE(p.notes, '') ILIKE '%' || $1 || '%')
                   AND ($2::int IS NULL OR EXTRACT(YEAR FROM p.start_date) = $2)
             ) t",
        )
        .bind(search)
        .bind(query.fiscal_year)
        .fetch_one(&self.pool)
        .await
        .map_err(db_error)?;

        Ok(rows.as_array().cloned().unwrap_or_default())
    }

    async fn get(&self, id: i64) -> Result<Option<Value>, AppError> {
        let row: Option<Value> = sqlx::query_scalar(
            "SELECT to_jsonb(t)
             FROM (
                 SELECT p.id,
                        p.period_code AS \"period\",
                        p.start_date AS \"startDate\",
                        p.end_date AS \"endDate\",
                        p.status,
                        p.closed_by AS \"closedById\",
                        COALESCE(u.name, '') AS \"closedBy\",
                        p.closed_at AS \"closedAt\",
                        COALESCE(p.notes, '') AS notes,
                        c.id AS \"closingId\",
                        COALESCE(c.document_number, '') AS \"documentNumber\",
                        COALESCE(c.status, p.status) AS \"closingStatus\",
                        EXTRACT(YEAR FROM p.start_date)::int AS \"fiscalYear\",
                        p.created_at AS \"createdAt\",
                        p.updated_at AS \"updatedAt\"
                 FROM accounting_period p
                 LEFT JOIN accounting_period_closing c ON c.period_id = p.id
                 LEFT JOIN masterdata_user u ON u.id = p.closed_by
                 WHERE p.id = $1
             ) t",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(db_error)?;

        Ok(row)
    }

    async fn create(&self, dto: &CreatePeriodDto) -> Result<Value, AppError> {
        if dto.start_date > dto.end_date {
            return Err(AppError::BadRequest(
                "startDate must be before or equal to endDate".into(),
            ));
        }

        let period_code = Self::normalize_period_code(dto.period_code.clone(), dto.start_date)?;
        let status = Self::normalize_status(dto.status.clone(), "open")?;
        let notes = Self::normalize_notes(dto.notes.clone());

        let id: i64 = sqlx::query_scalar(
            "INSERT INTO accounting_period (period_code, start_date, end_date, status, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id",
        )
        .bind(&period_code)
        .bind(dto.start_date)
        .bind(dto.end_date)
        .bind(&status)
        .bind(notes)
        .fetch_one(&self.pool)
        .await
        .map_err(db_error)?;

        self.reload(id).await
    }

    async fn update(&self, id: i64, dto: &UpdatePeriodDto) -> Result<Value, AppError> {
        let current = Self::fetch_row(&self.pool, id)
            .await?
            .ok_or_else(|| AppError::NotFound("accounting period not found".into()))?;

        let start_date = dto.start_date.unwrap_or(current.start_date);
        let end_date = dto.end_date.unwrap_or(current.end_date);

        if start_date > end_date {
            return Err(AppError::BadRequest(
                "startDate must be before or equal to endDate".into(),
            ));
        }

        let period_code = Self::normalize_period_code(dto.period_code.clone(), start_date)?;
        let status = Self::normalize_status(dto.status.clone(), &current.status)?;
        let notes = match &dto.notes {
            Some(value) => Self::normalize_notes(Some(value.clone())),
            None => current.notes.clone(),
        };
        let closed_by = dto.closed_by.or(current.closed_by);

        sqlx::query(
            "UPDATE accounting_period
             SET period_code = $2,
                 start_date = $3,
                 end_date = $4,
                 status = $5,
                 closed_by = $6,
                 notes = $7,
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(&period_code)
        .bind(start_date)
        .bind(end_date)
        .bind(&status)
        .bind(closed_by)
        .bind(notes)
        .execute(&self.pool)
        .await
        .map_err(db_error)?;

        self.reload(id).await
    }

    async fn delete(&self, id: i64) -> Result<bool, AppError> {
        let exists: bool =
            sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM accounting_period WHERE id = $1)")
                .bind(id)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;

        if !exists {
            return Ok(false);
        }

        let journal_count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM accounting_journal WHERE period_id = $1")
                .bind(id)
                .fetch_one(&self.pool)
                .await
                .map_err(db_error)?;

        if journal_count > 0 {
            return Err(AppError::Conflict(
                "This period already has journals and cannot be deleted".into(),
            ));
        }

        let mut tx = self.pool.begin().await.map_err(db_error)?;

        sqlx::query("DELETE FROM accounting_period_closing WHERE period_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;

        let result = sqlx::query("DELETE FROM accounting_period WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(db_error)?;

        tx.commit().await.map_err(db_error)?;

        Ok(result.rows_affected() > 0)
    }

    async fn close(&self, id: i64, dto: &PeriodActionDto) -> Result<Value, AppError> {
        let current = Self::fetch_row(&self.pool, id)
            .await?
            .ok_or_else(|| AppError::NotFound("accounting period not found".into()))?;

        if current.status == "closed" {
            return self.reload(id).await;
        }

        let closed_by = dto.closed_by.or(current.closed_by);
        let notes = match &dto.notes {
            Some(value) => Self::normalize_notes(Some(value.clone())),
            None => current.notes.clone(),
        };
        let document_number = format!(
            "PC/{}/{}",
            current.period_code.replace('-', ""),
            Utc::now().timestamp_millis()
        );

        let mut tx = self.pool.begin().await.map_err(db_error)?;

        sqlx::query(
            "UPDATE accounting_period
             SET status = 'closed',
                 closed_by = $2,
                 closed_at = now(),
                 notes = COALESCE($3, notes),
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(closed_by)
        .bind(&notes)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        sqlx::query(
            "INSERT INTO accounting_period_closing
                (document_number, period_id, closing_date, status, notes, closed_by, closed_at)
             VALUES ($1, $2, $3, 'completed', $4, $5, now())
             ON CONFLICT (period_id) DO UPDATE SET
                document_number = EXCLUDED.document_number,
                closing_date = EXCLUDED.closing_date,
                status = 'completed',
                notes = EXCLUDED.notes,
                closed_by = EXCLUDED.closed_by,
                closed_at = now(),
                updated_at = now()",
        )
        .bind(&document_number)
        .bind(id)
        .bind(current.end_date)
        .bind(&notes)
        .bind(closed_by)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        tx.commit().await.map_err(db_error)?;

        self.reload(id).await
    }

    async fn reopen(&self, id: i64, dto: &PeriodActionDto) -> Result<Value, AppError> {
        let current = Self::fetch_row(&self.pool, id)
            .await?
            .ok_or_else(|| AppError::NotFound("accounting period not found".into()))?;

        let notes = match &dto.notes {
            Some(value) => Self::normalize_notes(Some(value.clone())),
            None => current.notes.clone(),
        };

        let mut tx = self.pool.begin().await.map_err(db_error)?;

        sqlx::query(
            "UPDATE accounting_period
             SET status = 'open',
                 closed_by = NULL,
                 closed_at = NULL,
                 notes = COALESCE($2, notes),
                 updated_at = now()
             WHERE id = $1",
        )
        .bind(id)
        .bind(&notes)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        sqlx::query(
            "UPDATE accounting_period_closing
             SET status = 'reopen',
                 closed_by = NULL,
                 closed_at = NULL,
                 notes = COALESCE($2, notes),
                 updated_at = now()
             WHERE period_id = $1",
        )
        .bind(id)
        .bind(&notes)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

        tx.commit().await.map_err(db_error)?;

        self.reload(id).await
    }
}

fn db_error(error: sqlx::Error) -> AppError {
    if let Some(database_error) = error.as_database_error() {
        match database_error.code().as_deref() {
            Some("23505") => {
                return AppError::Conflict(
                    "An accounting period with the same code already exists".into(),
                );
            }
            Some("23503") => {
                return AppError::Conflict(
                    "This period is still referenced by other data and cannot be deleted".into(),
                );
            }
            _ => {}
        }
    }
    AppError::Database(error.to_string())
}
