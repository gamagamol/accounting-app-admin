use std::collections::BTreeMap;
use std::sync::Arc;

use async_trait::async_trait;
use chrono::{SecondsFormat, Utc};
use uuid::Uuid;

use crate::core::audit::entities::{
    AUDIT_ACTIONS, AUDIT_STATUSES, AuditError, AuditLogEntry, is_valid_audit_action,
    is_valid_audit_status,
};
use crate::core::audit::interfaces::{AuditFilter, AuditRepository, AuditUsecase};
use crate::core::audit::usecases::dto::{
    CreateAuditLogRequest, ListAuditLogsRequest, ListAuditLogsResult,
};

pub struct AuditUsecaseImpl {
    repo: Arc<dyn AuditRepository>,
}

impl AuditUsecaseImpl {
    pub fn new(repo: Arc<dyn AuditRepository>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl AuditUsecase for AuditUsecaseImpl {
    async fn list(&self, request: ListAuditLogsRequest) -> Result<ListAuditLogsResult, AuditError> {
        let (page, limit) = normalize_pagination(request.page, request.limit);

        let (items, total) = self
            .repo
            .list(AuditFilter {
                module: clean(request.module),
                entity_type: clean(request.entity_type),
                entity_id: clean(request.entity_id),
                search: clean(request.search),
                offset: i64::from(page.saturating_sub(1)) * i64::from(limit),
                limit: i64::from(limit),
            })
            .await?;

        Ok(ListAuditLogsResult {
            items,
            total,
            page,
            limit,
        })
    }

    async fn get(&self, id: String) -> Result<AuditLogEntry, AuditError> {
        let id = id.trim();
        if id.is_empty() {
            return Err(AuditError::NotFound);
        }
        self.repo.get_by_id(id).await
    }

    async fn create(&self, request: CreateAuditLogRequest) -> Result<AuditLogEntry, AuditError> {
        let mut errors = BTreeMap::new();

        let module = required("module", request.module, &mut errors);
        let entity_type = required("entityType", request.entity_type, &mut errors);
        let entity_id = required("entityId", request.entity_id, &mut errors);
        let action = required("action", request.action, &mut errors).to_lowercase();
        let status = required("status", request.status, &mut errors).to_lowercase();
        let summary = required("summary", request.summary, &mut errors);

        if !action.is_empty() && !is_valid_audit_action(&action) {
            errors.insert(
                "action".to_string(),
                format!("action must be one of: {}", AUDIT_ACTIONS.join(", ")),
            );
        }

        if !status.is_empty() && !is_valid_audit_status(&status) {
            errors.insert(
                "status".to_string(),
                format!("status must be one of: {}", AUDIT_STATUSES.join(", ")),
            );
        }

        let timestamp = request
            .timestamp
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string)
            .unwrap_or_else(|| Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true));

        if chrono::DateTime::parse_from_rfc3339(&timestamp).is_err() {
            errors.insert(
                "timestamp".to_string(),
                "timestamp must be a valid RFC 3339 date".to_string(),
            );
        }

        if !errors.is_empty() {
            return Err(AuditError::Validation(errors));
        }

        let document_number = if request.document_number.trim().is_empty() {
            entity_id.clone()
        } else {
            request.document_number.trim().to_string()
        };

        let actor = request.actor.trim();
        let description = request.description.trim();
        let entry = AuditLogEntry {
            id: Uuid::new_v4().to_string(),
            module,
            entity_type,
            entity_id,
            document_number,
            action,
            status,
            actor: if actor.is_empty() {
                "System".to_string()
            } else {
                actor.to_string()
            },
            timestamp,
            summary: summary.clone(),
            description: if description.is_empty() {
                summary
            } else {
                description.to_string()
            },
            changes: request.changes,
        };

        self.repo.create(&entry).await?;

        tracing::info!(
            audit_id = %entry.id,
            entity_type = %entry.entity_type,
            entity_id = %entry.entity_id,
            action = %entry.action,
            "audit log created"
        );

        Ok(entry)
    }

    async fn delete(&self, id: String) -> Result<(), AuditError> {
        let id = id.trim();
        if id.is_empty() {
            return Err(AuditError::NotFound);
        }
        self.repo.delete(id).await
    }

    async fn delete_for_entity(
        &self,
        entity_type: String,
        entity_id: String,
    ) -> Result<u64, AuditError> {
        let entity_type = entity_type.trim();
        let entity_id = entity_id.trim();
        if entity_type.is_empty() || entity_id.is_empty() {
            return Err(AuditError::BadRequest(
                "entityType and entityId are required".to_string(),
            ));
        }
        self.repo.delete_for_entity(entity_type, entity_id).await
    }
}

fn required(field: &str, value: String, errors: &mut BTreeMap<String, String>) -> String {
    let value = value.trim().to_string();
    if value.is_empty() {
        errors.insert(field.to_string(), format!("{field} is required"));
    }
    value
}

fn clean(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn normalize_pagination(page: u32, limit: u32) -> (u32, u32) {
    let page = if page == 0 { 1 } else { page };
    let limit = if limit == 0 { 50 } else { limit.min(100) };
    (page, limit)
}
