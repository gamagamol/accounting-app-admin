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
        let has_root = query
            .root_transaction_id
            .as_deref()
            .map(str::trim)
            .is_some_and(|value| !value.is_empty());

        let filter = AuditFilter {
            root_transaction_id: query.root_transaction_id,
            module: query.module,
            entity_type: query.entity_type,
            entity_id: query.entity_id,
            search: query.search,
            ascending: has_root,
            offset,
            limit: limit as i64,
        };

        let (entries, total) = self.repo.list(filter).await.map_err(AppError::Database)?;
        let meta = PaginationMeta::new(page, limit, total as u64);

        Ok((entries, meta))
    }

    async fn timeline(&self, root_transaction_id: &str) -> Result<Vec<AuditLogEntry>, AppError> {
        let root = root_transaction_id.trim();
        if root.is_empty() {
            return Err(AppError::BadRequest(
                "rootTransactionId is required".to_string(),
            ));
        }

        let filter = AuditFilter {
            root_transaction_id: Some(root.to_string()),
            ascending: true,
            offset: 0,
            limit: 1000,
            ..Default::default()
        };

        let (mut entries, _) = self.repo.list(filter).await.map_err(AppError::Database)?;
        entries.sort_by(|left, right| left.timestamp.cmp(&right.timestamp));
        Ok(entries)
    }

    async fn get_by_id(&self, id: &str) -> Result<AuditLogEntry, AppError> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Audit log entry not found".to_string()))
    }

    async fn create(&self, dto: CreateAuditDto) -> Result<AuditLogEntry, AppError> {
        if dto.module.trim().is_empty() {
            return Err(AppError::BadRequest("Module is required".to_string()));
        }
        if dto.entity_type.trim().is_empty() {
            return Err(AppError::BadRequest("entityType is required".to_string()));
        }
        if dto.action.trim().is_empty() {
            return Err(AppError::BadRequest("action is required".to_string()));
        }

        let entry = AuditLogEntry {
            id: Id::generate().0,
            root_transaction_id: dto.root_transaction_id.trim().to_string(),
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
}
