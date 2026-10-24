use async_trait::async_trait;

use crate::core::audit::entities::{AuditError, AuditLogEntry};
use crate::core::audit::usecases::dto::{
    CreateAuditLogRequest, ListAuditLogsRequest, ListAuditLogsResult,
};

#[async_trait]
pub trait AuditUsecase: Send + Sync {
    async fn list(&self, request: ListAuditLogsRequest) -> Result<ListAuditLogsResult, AuditError>;
    async fn get(&self, id: String) -> Result<AuditLogEntry, AuditError>;
    async fn create(&self, request: CreateAuditLogRequest) -> Result<AuditLogEntry, AuditError>;
    async fn delete(&self, id: String) -> Result<(), AuditError>;
    async fn delete_for_entity(
        &self,
        entity_type: String,
        entity_id: String,
    ) -> Result<u64, AuditError>;
}
