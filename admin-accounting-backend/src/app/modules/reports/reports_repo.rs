use chrono::{Datelike, NaiveDate};
use serde_json::Value;
use sqlx::PgPool;

use super::reports_dto::ReportKind;
use super::reports_interfaces::IReportRepo;

macro_rules! sql {
    ($($arg:tt)*) => {
        sqlx::AssertSqlSafe(format!($($arg)*))
    };
}

pub struct ReportRepo {
    pool: PgPool,
}

impl ReportRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    async fn get_view(&self, kind: ReportKind) -> Result<Value, String> {
        let view = kind.view();
        sqlx::query_scalar(sql!(
            "SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM {view} t"
        ))
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())
    }

    async fn get_financial(&self, kind: ReportKind, period: &str) -> Result<Value, String> {
        let (start, end) = period_bounds(period)?;

        match kind {
            ReportKind::GeneralLedger => {
                sqlx::query_scalar(
                    "SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.date, t.journal_id, t.line_number), '[]'::jsonb)
                     FROM (
                         SELECT j.id AS journal_id,
                                j.journal_number,
                                j.journal_date AS date,
                                j.journal_type,
                                j.reference_type,
                                j.reference_id,
                                c.account_code,
                                c.account_name,
                                c.account_type,
                                d.description,
                                d.debit::float8 AS debit,
                                d.credit::float8 AS credit,
                                (d.debit - d.credit)::float8 AS balance,
                                d.line_number
                         FROM accounting_journal j
                         JOIN accounting_journal_detail d ON d.journal_id = j.id
                         JOIN masterdata_coa c ON c.id = d.coa_id
                         WHERE j.status = 'completed'
                           AND j.journal_date >= $1
                           AND j.journal_date < $2
                     ) t",
                )
                .bind(start)
                .bind(end)
                .fetch_one(&self.pool)
                .await
                .map_err(|error| error.to_string())
            }
            ReportKind::TrialBalance => {
                sqlx::query_scalar(
                    "WITH entries AS (
                         SELECT d.coa_id,
                                SUM(d.debit) AS total_debit,
                                SUM(d.credit) AS total_credit
                         FROM accounting_journal j
                         JOIN accounting_journal_detail d ON d.journal_id = j.id
                         WHERE j.status = 'completed'
                           AND j.journal_date < $1
                         GROUP BY d.coa_id
                     )
                     SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.account_code), '[]'::jsonb)
                     FROM (
                         SELECT c.id AS coa_id,
                                c.account_code,
                                c.account_name,
                                c.account_type,
                                COALESCE(e.total_debit, 0)::float8 AS total_debit,
                                COALESCE(e.total_credit, 0)::float8 AS total_credit,
                                (COALESCE(e.total_debit, 0) - COALESCE(e.total_credit, 0))::float8 AS balance
                         FROM masterdata_coa c
                         LEFT JOIN entries e ON e.coa_id = c.id
                         WHERE c.is_header = FALSE
                     ) t",
                )
                .bind(end)
                .fetch_one(&self.pool)
                .await
                .map_err(|error| error.to_string())
            }
            ReportKind::ProfitLoss => {
                sqlx::query_scalar(
                    "WITH entries AS (
                         SELECT d.coa_id,
                                SUM(d.debit) AS total_debit,
                                SUM(d.credit) AS total_credit
                         FROM accounting_journal j
                         JOIN accounting_journal_detail d ON d.journal_id = j.id
                         WHERE j.status = 'completed'
                           AND j.journal_date >= $1
                           AND j.journal_date < $2
                         GROUP BY d.coa_id
                     ),
                     tb AS (
                         SELECT c.account_code,
                                c.account_name,
                                c.account_type,
                                COALESCE(e.total_debit, 0)::float8 AS total_debit,
                                COALESCE(e.total_credit, 0)::float8 AS total_credit,
                                (COALESCE(e.total_debit, 0) - COALESCE(e.total_credit, 0))::float8 AS balance
                         FROM masterdata_coa c
                         LEFT JOIN entries e ON e.coa_id = c.id
                         WHERE c.is_header = FALSE
                     )
                     SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.account_code), '[]'::jsonb)
                     FROM (
                         SELECT account_type,
                                account_code,
                                account_name,
                                total_debit,
                                total_credit,
                                CASE WHEN account_type = 'revenue' THEN -balance ELSE balance END AS amount
                         FROM tb
                         WHERE account_type IN ('revenue', 'expense')
                     ) t",
                )
                .bind(start)
                .bind(end)
                .fetch_one(&self.pool)
                .await
                .map_err(|error| error.to_string())
            }
            ReportKind::BalanceSheet => {
                sqlx::query_scalar(
                    "WITH entries AS (
                         SELECT d.coa_id,
                                SUM(d.debit) AS total_debit,
                                SUM(d.credit) AS total_credit
                         FROM accounting_journal j
                         JOIN accounting_journal_detail d ON d.journal_id = j.id
                         WHERE j.status = 'completed'
                           AND j.journal_date < $1
                         GROUP BY d.coa_id
                     ),
                     tb AS (
                         SELECT c.account_type,
                                c.account_code,
                                c.account_name,
                                (COALESCE(e.total_debit, 0) - COALESCE(e.total_credit, 0))::float8 AS balance
                         FROM masterdata_coa c
                         LEFT JOIN entries e ON e.coa_id = c.id
                         WHERE c.is_header = FALSE
                     )
                     SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.account_code), '[]'::jsonb)
                     FROM (
                         SELECT account_type,
                                account_code,
                                account_name,
                                CASE WHEN account_type IN ('liability', 'equity') THEN -balance ELSE balance END AS balance
                         FROM tb
                         WHERE account_type IN ('asset', 'liability', 'equity')
                         UNION ALL
                         SELECT 'equity'::varchar(20) AS account_type,
                                '399'::varchar(20) AS account_code,
                                'CURRENT PERIOD EARNINGS'::varchar(150) AS account_name,
                                -COALESCE(SUM(balance), 0)::float8 AS balance
                         FROM tb
                         WHERE account_type IN ('revenue', 'expense')
                     ) t",
                )
                .bind(end)
                .fetch_one(&self.pool)
                .await
                .map_err(|error| error.to_string())
            }
            ReportKind::CashFlow => {
                sqlx::query_scalar(
                    "SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.journal_type), '[]'::jsonb)
                     FROM (
                         SELECT j.journal_type,
                                COALESCE(SUM(d.debit), 0)::float8 AS cash_in,
                                COALESCE(SUM(d.credit), 0)::float8 AS cash_out,
                                COALESCE(SUM(d.debit - d.credit), 0)::float8 AS net_cash_flow
                         FROM accounting_journal j
                         JOIN accounting_journal_detail d ON d.journal_id = j.id
                         WHERE j.status = 'completed'
                           AND j.journal_date >= $1
                           AND j.journal_date < $2
                           AND EXISTS (
                               SELECT 1
                               FROM masterdata_bank_account ba
                               WHERE ba.coa_id = d.coa_id
                           )
                         GROUP BY j.journal_type
                     ) t",
                )
                .bind(start)
                .bind(end)
                .fetch_one(&self.pool)
                .await
                .map_err(|error| error.to_string())
            }
            _ => self.get_view(kind).await,
        }
    }
}

#[async_trait::async_trait]
impl IReportRepo for ReportRepo {
    async fn get(&self, kind: ReportKind, period: Option<&str>) -> Result<Value, String> {
        match period {
            Some(period) if kind.is_financial() => self.get_financial(kind, period).await,
            _ => self.get_view(kind).await,
        }
    }

    async fn get_lock(&self, report_code: &str, period: &str) -> Result<Option<Value>, String> {
        sqlx::query_scalar(
            "SELECT to_jsonb(t) FROM report_lock t
             WHERE t.report_code = $1 AND t.period = $2",
        )
        .bind(report_code)
        .bind(period)
        .fetch_optional(&self.pool)
        .await
        .map_err(|error| error.to_string())
    }

    async fn upsert_lock(
        &self,
        report_code: &str,
        period: &str,
        as_of_date: NaiveDate,
        payload: Value,
        locked_by: Option<i64>,
        notes: Option<String>,
    ) -> Result<Value, String> {
        sqlx::query_scalar(
            "INSERT INTO report_lock
                (report_code, period, as_of_date, payload, locked_by, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (report_code, period) DO UPDATE
             SET as_of_date = EXCLUDED.as_of_date,
                 payload = EXCLUDED.payload,
                 locked_by = EXCLUDED.locked_by,
                 locked_at = now(),
                 notes = EXCLUDED.notes
             RETURNING to_jsonb(report_lock)",
        )
        .bind(report_code)
        .bind(period)
        .bind(as_of_date)
        .bind(payload)
        .bind(locked_by)
        .bind(notes)
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())
    }

    async fn delete_lock(&self, report_code: &str, period: &str) -> Result<bool, String> {
        let result = sqlx::query("DELETE FROM report_lock WHERE report_code = $1 AND period = $2")
            .bind(report_code)
            .bind(period)
            .execute(&self.pool)
            .await
            .map_err(|error| error.to_string())?;
        Ok(result.rows_affected() > 0)
    }
}

fn period_bounds(period: &str) -> Result<(NaiveDate, NaiveDate), String> {
    let period = period.trim();

    // Fiscal-year mode: YYYY spans January through December of that year.
    if period.len() == 4 {
        let year = period
            .parse::<i32>()
            .map_err(|_| format!("Invalid period '{period}'. Expected YYYY or YYYY-MM."))?;
        let start = NaiveDate::from_ymd_opt(year, 1, 1)
            .ok_or_else(|| format!("Invalid period '{period}'"))?;
        let end = NaiveDate::from_ymd_opt(year + 1, 1, 1)
            .ok_or_else(|| format!("Invalid period '{period}'"))?;
        return Ok((start, end));
    }

    let start = NaiveDate::parse_from_str(&format!("{period}-01"), "%Y-%m-%d")
        .map_err(|_| format!("Invalid period '{period}'. Expected YYYY or YYYY-MM."))?;
    let (next_year, next_month) = if start.month() == 12 {
        (start.year() + 1, 1)
    } else {
        (start.year(), start.month() + 1)
    };
    let end = NaiveDate::from_ymd_opt(next_year, next_month, 1)
        .ok_or_else(|| format!("Invalid period '{period}'"))?;
    Ok((start, end))
}

#[cfg(test)]
mod tests {
    use super::period_bounds;

    #[test]
    fn period_bounds_crosses_year_end() {
        let (start, end) = period_bounds("2026-12").expect("valid period");
        assert_eq!(start.to_string(), "2026-12-01");
        assert_eq!(end.to_string(), "2027-01-01");
    }

    #[test]
    fn period_bounds_supports_fiscal_year() {
        let (start, end) = period_bounds("2026").expect("valid fiscal year");
        assert_eq!(start.to_string(), "2026-01-01");
        assert_eq!(end.to_string(), "2027-01-01");
    }

    #[test]
    fn period_bounds_rejects_bad_input() {
        assert!(period_bounds("2026-13").is_err());
        assert!(period_bounds("not-a-period").is_err());
    }
}
