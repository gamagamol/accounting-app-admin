use async_trait::async_trait;
use sqlx::{AssertSqlSafe, PgPool};
use uuid::Uuid;

use crate::core::pending::entities::{
    PendingDecision, PendingError, PendingFilter, PendingRequest, PendingRequestRow,
    pending_table_name,
};
use crate::core::pending::interfaces::PendingRepository;

/// PostgreSQL pending repository.
///
/// Every transaction type has its own `transaction_<type>_pending` table. The
/// table name is never taken from user input directly; it comes from the
/// static allowlist in `pending_table_name`.
pub struct PostgresPendingRepository {
    pool: PgPool,
}

impl PostgresPendingRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

const SELECT_COLUMNS: &str = r#"
    id,
    transaction_id,
    transaction_number,
    status,
    requested_at,
    requested_by,
    pending_message,
    approved_at,
    approved_by,
    approval_message,
    rejected_at,
    rejected_by,
    rejection_message,
    created_at,
    updated_at
"#;

#[async_trait]
impl PendingRepository for PostgresPendingRepository {
    async fn list(
        &self,
        filter: PendingFilter,
    ) -> Result<(Vec<PendingRequest>, i64), PendingError> {
        let table = table_name(&filter.transaction_type)?;

        let count_sql = format!(
            "SELECT COUNT(*) FROM {table}
             WHERE ($1::text IS NULL OR transaction_id = $1)
               AND ($2::text IS NULL OR status = $2)"
        );

        let total: i64 = sqlx::query_scalar(AssertSqlSafe(count_sql))
            .bind(filter.transaction_id.as_deref())
            .bind(filter.status.as_deref())
            .fetch_one(&self.pool)
            .await
            .map_err(map_sqlx_error)?;

        let list_sql = format!(
            "SELECT {SELECT_COLUMNS} FROM {table}
             WHERE ($1::text IS NULL OR transaction_id = $1)
               AND ($2::text IS NULL OR status = $2)
             ORDER BY requested_at DESC
             OFFSET $3
             LIMIT $4"
        );

        let rows = sqlx::query_as::<_, PendingRequestRow>(AssertSqlSafe(list_sql))
            .bind(filter.transaction_id.as_deref())
            .bind(filter.status.as_deref())
            .bind(filter.offset.max(0))
            .bind(filter.limit.max(0))
            .fetch_all(&self.pool)
            .await
            .map_err(map_sqlx_error)?;

        let items = rows
            .into_iter()
            .map(|row| row.into_request(&filter.transaction_type))
            .collect();

        Ok((items, total))
    }

    async fn get_by_id(
        &self,
        transaction_type: &str,
        id: Uuid,
    ) -> Result<PendingRequest, PendingError> {
        let table = table_name(transaction_type)?;
        let sql = format!("SELECT {SELECT_COLUMNS} FROM {table} WHERE id = $1");

        let row = sqlx::query_as::<_, PendingRequestRow>(AssertSqlSafe(sql))
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(map_sqlx_error)?
            .ok_or(PendingError::NotFound)?;

        Ok(row.into_request(transaction_type))
    }

    async fn create(&self, request: &PendingRequest) -> Result<(), PendingError> {
        let table = table_name(&request.transaction_type)?;

        let sql = format!(
            "INSERT INTO {table} (
                id,
                transaction_id,
                transaction_number,
                status,
                requested_at,
                requested_by,
                pending_message,
                approval_message,
                rejection_message,
                created_at,
                updated_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)"
        );

        sqlx::query(AssertSqlSafe(sql))
            .bind(request.id)
            .bind(&request.transaction_id)
            .bind(&request.transaction_number)
            .bind(&request.status)
            .bind(request.requested_at)
            .bind(&request.requested_by)
            .bind(&request.pending_message)
            .bind(&request.approval_message)
            .bind(&request.rejection_message)
            .bind(request.created_at)
            .bind(request.updated_at)
            .execute(&self.pool)
            .await
            .map_err(map_sqlx_error)?;

        Ok(())
    }

    async fn decide(
        &self,
        transaction_type: &str,
        id: Uuid,
        decision: PendingDecision,
    ) -> Result<PendingRequest, PendingError> {
        let table = table_name(transaction_type)?;

        let sql = match decision.status.as_str() {
            "approved" => format!(
                "UPDATE {table}
                 SET status = 'approved',
                     approved_at = $2,
                     approved_by = $3,
                     approval_message = $4,
                     updated_at = $2
                 WHERE id = $1 AND status = 'pending'
                 RETURNING {SELECT_COLUMNS}"
            ),
            "rejected" => format!(
                "UPDATE {table}
                 SET status = 'rejected',
                     rejected_at = $2,
                     rejected_by = $3,
                     rejection_message = $4,
                     updated_at = $2
                 WHERE id = $1 AND status = 'pending'
                 RETURNING {SELECT_COLUMNS}"
            ),
            _ => {
                return Err(PendingError::BadRequest(
                    "decision must be approved or rejected".to_string(),
                ));
            }
        };

        let row = sqlx::query_as::<_, PendingRequestRow>(AssertSqlSafe(sql))
            .bind(id)
            .bind(decision.decided_at)
            .bind(&decision.actor)
            .bind(&decision.message)
            .fetch_optional(&self.pool)
            .await
            .map_err(map_sqlx_error)?
            .ok_or_else(|| {
                PendingError::BadRequest(
                    "pending request was not found or has already been decided".to_string(),
                )
            })?;

        Ok(row.into_request(transaction_type))
    }
}

fn table_name(transaction_type: &str) -> Result<&'static str, PendingError> {
    pending_table_name(transaction_type).ok_or_else(|| {
        PendingError::BadRequest(format!("unsupported transactionType: {transaction_type}"))
    })
}

fn map_sqlx_error(error: sqlx::Error) -> PendingError {
    if let sqlx::Error::Database(database_error) = &error
        && database_error.code().as_deref() == Some("23505")
    {
        return PendingError::Conflict("transaction already has a pending request".to_string());
    }

    PendingError::Database(error.to_string())
}
