use async_trait::async_trait;

use crate::core::audit::entities::{AuditError, AuditLogEntry};

#[derive(Debug, Clone, Default)]
pub struct AuditFilter {
    pub module: Option<String>,
    pub entity_type: Option<String>,
    pub entity_id: Option<String>,
    pub search: Option<String>,
    pub offset: i64,
    pub limit: i64,
}

#[async_trait]
pub trait AuditRepository: Send + Sync {
    async fn list(&self, filter: AuditFilter) -> Result<(Vec<AuditLogEntry>, i64), AuditError>;
    async fn get_by_id(&self, id: &str) -> Result<AuditLogEntry, AuditError>;
    async fn create(&self, entry: &AuditLogEntry) -> Result<(), AuditError>;
    async fn delete(&self, id: &str) -> Result<(), AuditError>;
    async fn delete_for_entity(
        &self,
        entity_type: &str,
        entity_id: &str,
    ) -> Result<u64, AuditError>;
}
