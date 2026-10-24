use std::collections::BTreeMap;
use std::sync::Arc;

use async_trait::async_trait;
use chrono::Utc;
use uuid::Uuid;

use crate::core::pending::entities::{
    PendingDecision, PendingError, PendingFilter, PendingRequest, is_approver_role,
    is_valid_pending_status, is_valid_pending_transaction_type,
};
use crate::core::pending::interfaces::{PendingRepository, PendingUsecase};
use crate::core::pending::usecases::dto::{
    CreatePendingRequest, ListPendingRequest, ListPendingResult, PendingDecisionRequest,
};

pub struct PendingUsecaseImpl {
    repo: Arc<dyn PendingRepository>,
}

impl PendingUsecaseImpl {
    pub fn new(repo: Arc<dyn PendingRepository>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl PendingUsecase for PendingUsecaseImpl {
    async fn list(&self, request: ListPendingRequest) -> Result<ListPendingResult, PendingError> {
        let transaction_type = required(
            "transactionType",
            request.transaction_type.unwrap_or_default(),
        )?;

        if !is_valid_pending_transaction_type(&transaction_type) {
            return Err(PendingError::BadRequest(format!(
                "unsupported transactionType: {transaction_type}"
            )));
        }

        let status = clean(request.status);
        if let Some(status) = status.as_deref()
            && !is_valid_pending_status(status)
        {
            return Err(PendingError::BadRequest(format!(
                "unsupported pending status: {status}"
            )));
        }

        let (page, limit) = normalize_pagination(request.page, request.limit);
        let (items, total) = self
            .repo
            .list(PendingFilter {
                transaction_type,
                transaction_id: clean(request.transaction_id),
                status,
                offset: i64::from(page.saturating_sub(1)) * i64::from(limit),
                limit: i64::from(limit),
            })
            .await?;

        Ok(ListPendingResult {
            items,
            total,
            page,
            limit,
        })
    }

    async fn get(
        &self,
        transaction_type: String,
        id: String,
    ) -> Result<PendingRequest, PendingError> {
        let transaction_type = validate_transaction_type(&transaction_type)?;
        let id = parse_uuid(&id)?;
        self.repo.get_by_id(&transaction_type, id).await
    }

    async fn create(&self, request: CreatePendingRequest) -> Result<PendingRequest, PendingError> {
        let transaction_type = validate_transaction_type(&request.transaction_type)?;
        let transaction_id = required("transactionId", request.transaction_id)?;
        let requested_by = required("requestedBy", request.requested_by)?;
        let pending_message = required("pendingMessage", request.pending_message)?;

        let transaction_number = request.transaction_number.trim().to_string();
        let now = Utc::now();
        let pending = PendingRequest {
            id: Uuid::new_v4(),
            transaction_type: transaction_type.clone(),
            transaction_id: transaction_id.clone(),
            transaction_number: if transaction_number.is_empty() {
                transaction_id
            } else {
                transaction_number
            },
            status: "pending".to_string(),
            requested_at: now,
            requested_by,
            pending_message,
            approved_at: None,
            approved_by: None,
            approval_message: String::new(),
            rejected_at: None,
            rejected_by: None,
            rejection_message: String::new(),
            created_at: now,
            updated_at: now,
        };

        self.repo.create(&pending).await?;

        tracing::info!(
            pending_id = %pending.id,
            transaction_type = %pending.transaction_type,
            transaction_id = %pending.transaction_id,
            requested_by = %pending.requested_by,
            "pending request created"
        );

        Ok(pending)
    }

    async fn approve(
        &self,
        transaction_type: String,
        id: String,
        request: PendingDecisionRequest,
    ) -> Result<PendingRequest, PendingError> {
        self.decide("approved", transaction_type, id, request).await
    }

    async fn reject(
        &self,
        transaction_type: String,
        id: String,
        request: PendingDecisionRequest,
    ) -> Result<PendingRequest, PendingError> {
        self.decide("rejected", transaction_type, id, request).await
    }
}

impl PendingUsecaseImpl {
    async fn decide(
        &self,
        status: &str,
        transaction_type: String,
        id: String,
        request: PendingDecisionRequest,
    ) -> Result<PendingRequest, PendingError> {
        let transaction_type = validate_transaction_type(&transaction_type)?;
        let id = parse_uuid(&id)?;
        let actor = required("actor", request.actor)?;
        let actor_role = required("actorRole", request.actor_role)?;
        let message = required("decisionMessage", request.decision_message)?;

        if !is_approver_role(&actor_role) {
            return Err(PendingError::Forbidden(
                "only an approver or administrator can decide a pending request".to_string(),
            ));
        }

        let existing = self.repo.get_by_id(&transaction_type, id).await?;
        if existing.status != "pending" {
            return Err(PendingError::BadRequest(
                "pending request has already been decided".to_string(),
            ));
        }

        let decision = PendingDecision {
            status: status.to_string(),
            actor,
            message,
            decided_at: Utc::now(),
        };

        let decided = self.repo.decide(&transaction_type, id, decision).await?;

        tracing::info!(
            pending_id = %decided.id,
            transaction_type = %decided.transaction_type,
            transaction_id = %decided.transaction_id,
            status = %decided.status,
            "pending request decided"
        );

        Ok(decided)
    }
}

fn validate_transaction_type(value: &str) -> Result<String, PendingError> {
    let value = required("transactionType", value.to_string())?;
    if !is_valid_pending_transaction_type(&value) {
        return Err(PendingError::BadRequest(format!(
            "unsupported transactionType: {value}"
        )));
    }
    Ok(value)
}

fn parse_uuid(value: &str) -> Result<Uuid, PendingError> {
    let value = value.trim();
    if value.is_empty() {
        return Err(PendingError::Validation(BTreeMap::from([(
            "id".to_string(),
            "id is required".to_string(),
        )])));
    }

    Uuid::parse_str(value).map_err(|_| {
        PendingError::Validation(BTreeMap::from([(
            "id".to_string(),
            "id must be a valid UUID".to_string(),
        )]))
    })
}

fn required(field: &str, value: String) -> Result<String, PendingError> {
    let value = value.trim().to_string();
    if value.is_empty() {
        return Err(PendingError::Validation(BTreeMap::from([(
            field.to_string(),
            format!("{field} is required"),
        )])));
    }
    Ok(value)
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
