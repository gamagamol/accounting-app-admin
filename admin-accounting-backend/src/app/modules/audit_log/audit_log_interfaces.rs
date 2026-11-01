use async_trait::async_trait;

use super::audit_log_dto::{CreateAuditDto, ListAuditQuery};
use super::audit_log_entity::{AuditFilter, AuditLogEntry};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

/// Kontrak untuk lapisan repository (akses data).
///
/// Audit is append-only: there is intentionally no update or delete method.
#[async_trait]
pub trait IAuditLogRepo: Send + Sync {
    async fn list(&self, filter: AuditFilter) -> Result<(Vec<AuditLogEntry>, i64), String>;
    async fn get_by_id(&self, id: &str) -> Result<Option<AuditLogEntry>, String>;
    async fn create(&self, entry: &AuditLogEntry) -> Result<(), String>;
}

/// Kontrak untuk lapisan usecase (logika bisnis).
#[async_trait]
pub trait IAuditLogUsecase: Send + Sync {
    async fn list(
        &self,
        query: ListAuditQuery,
    ) -> Result<(Vec<AuditLogEntry>, PaginationMeta), AppError>;
    async fn timeline(&self, root_transaction_id: &str) -> Result<Vec<AuditLogEntry>, AppError>;
    async fn get_by_id(&self, id: &str) -> Result<AuditLogEntry, AppError>;
    async fn create(&self, dto: CreateAuditDto) -> Result<AuditLogEntry, AppError>;
}
