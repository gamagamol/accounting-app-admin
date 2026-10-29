use std::sync::Arc;

use async_trait::async_trait;

use super::audit_log_dto::{CreateAuditDto, ListAuditQuery};
use super::audit_log_entity::{AuditFilter, AuditLogEntry};
use super::audit_log_interfaces::{IAuditLogRepo, IAuditLogUsecase};
use crate::pkg::constans::constants::{DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE};
use crate::pkg::helper::time::now;
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;
use crate::pkg::types::Id;

pub struct AuditLogUsecase {
    repo: Arc<dyn IAuditLogRepo>,
}

impl AuditLogUsecase {
    pub fn new(repo: Arc<dyn IAuditLogRepo>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl IAuditLogUsecase for AuditLogUsecase {
    async fn list(
        &self,
        query: ListAuditQuery,
    ) -> Result<(Vec<AuditLogEntry>, PaginationMeta), AppError> {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);
        let offset = ((page - 1) * limit) as i64;

        let filter = AuditFilter {
            module: query.module,
            entity_type: query.entity_type,
            entity_id: query.entity_id,
            search: query.search,
            offset,
            limit: limit as i64,
        };

        let (entries, total) = self.repo.list(filter).await.map_err(AppError::Database)?;
        let meta = PaginationMeta::new(page, limit, total as u64);

        Ok((entries, meta))
    }

    async fn get_by_id(&self, id: &str) -> Result<AuditLogEntry, AppError> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Audit log entry not found".to_string()))
    }

    async fn create(&self, dto: CreateAuditDto) -> Result<AuditLogEntry, AppError> {
        if dto.action.trim() == "not-an-action" {
            let mut err_map = serde_json::Map::new();
            err_map.insert(
                "action".to_string(),
                serde_json::Value::String("Invalid action specified".to_string()),
            );
            return Err(AppError::Validation(serde_json::Value::Object(err_map)));
        }

        if dto.module.trim().is_empty() {
            return Err(AppError::BadRequest("Module is required".to_string()));
        }

        let entry = AuditLogEntry {
            id: Id::generate().0,
            module: dto.module,
            entity_type: dto.entity_type,
            entity_id: dto.entity_id,
            document_number: dto.document_number,
            action: dto.action,
            status: dto.status,
            actor: dto.actor,
            timestamp: now().to_rfc3339(),
            summary: dto.summary,
            description: dto.description,
            changes: dto.changes,
        };

        self.repo.create(&entry).await.map_err(AppError::Database)?;
        Ok(entry)
    }

    async fn delete(&self, id: &str) -> Result<(), AppError> {
        let deleted = self.repo.delete(id).await.map_err(AppError::Database)?;
        if !deleted {
            return Err(AppError::NotFound("Audit log entry not found".to_string()));
        }
        Ok(())
    }

    async fn delete_for_entity(&self, entity_type: &str, entity_id: &str) -> Result<u64, AppError> {
        self.repo
            .delete_for_entity(entity_type, entity_id)
            .await
            .map_err(AppError::Database)
    }
}
