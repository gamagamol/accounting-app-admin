use std::collections::HashMap;
use std::sync::RwLock;

use async_trait::async_trait;
use uuid::Uuid;

use crate::core::pending::entities::{
    PendingDecision, PendingError, PendingFilter, PendingRequest,
};
use crate::core::pending::interfaces::PendingRepository;

/// In-memory pending repository for local development and tests. Data resets
/// when the process restarts.
pub struct MemoryPendingRepository {
    requests: RwLock<HashMap<Uuid, PendingRequest>>,
}

impl MemoryPendingRepository {
    pub fn new() -> Self {
        Self {
            requests: RwLock::new(HashMap::new()),
        }
    }

    fn read_requests(&self) -> std::sync::RwLockReadGuard<'_, HashMap<Uuid, PendingRequest>> {
        self.requests
            .read()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }

    fn write_requests(&self) -> std::sync::RwLockWriteGuard<'_, HashMap<Uuid, PendingRequest>> {
        self.requests
            .write()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }
}

impl Default for MemoryPendingRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PendingRepository for MemoryPendingRepository {
    async fn list(
        &self,
        filter: PendingFilter,
    ) -> Result<(Vec<PendingRequest>, i64), PendingError> {
        let requests = self.read_requests();

        let mut items: Vec<PendingRequest> = requests
            .values()
            .filter(|request| request.transaction_type == filter.transaction_type)
            .filter(|request| {
                filter
                    .transaction_id
                    .as_deref()
                    .is_none_or(|transaction_id| request.transaction_id == transaction_id)
            })
            .filter(|request| {
                filter
                    .status
                    .as_deref()
                    .is_none_or(|status| request.status == status)
            })
            .cloned()
            .collect();

        items.sort_by_key(|request| std::cmp::Reverse(request.requested_at));

        let total = items.len() as i64;
        let start = filter.offset.max(0) as usize;
        let limit = filter.limit.max(0) as usize;
        let end = start.saturating_add(limit).min(items.len());

        let items = if start < items.len() {
            items[start..end].to_vec()
        } else {
            Vec::new()
        };

        Ok((items, total))
    }

    async fn get_by_id(
        &self,
        transaction_type: &str,
        id: Uuid,
    ) -> Result<PendingRequest, PendingError> {
        self.read_requests()
            .get(&id)
            .filter(|request| request.transaction_type == transaction_type)
            .cloned()
            .ok_or(PendingError::NotFound)
    }

    async fn create(&self, request: &PendingRequest) -> Result<(), PendingError> {
        let mut requests = self.write_requests();

        let has_active = requests.values().any(|existing| {
            existing.transaction_type == request.transaction_type
                && existing.transaction_id == request.transaction_id
                && existing.status == "pending"
        });

        if has_active {
            return Err(PendingError::Conflict(
                "transaction already has a pending request".to_string(),
            ));
        }

        requests.insert(request.id, request.clone());
        Ok(())
    }

    async fn decide(
        &self,
        transaction_type: &str,
        id: Uuid,
        decision: PendingDecision,
    ) -> Result<PendingRequest, PendingError> {
        let mut requests = self.write_requests();
        let request = requests
            .get_mut(&id)
            .filter(|request| request.transaction_type == transaction_type)
            .ok_or(PendingError::NotFound)?;

        if request.status != "pending" {
            return Err(PendingError::BadRequest(
                "pending request has already been decided".to_string(),
            ));
        }

        request.status = decision.status.clone();
        request.updated_at = decision.decided_at;

        match decision.status.as_str() {
            "approved" => {
                request.approved_at = Some(decision.decided_at);
                request.approved_by = Some(decision.actor);
                request.approval_message = decision.message;
            }
            "rejected" => {
                request.rejected_at = Some(decision.decided_at);
                request.rejected_by = Some(decision.actor);
                request.rejection_message = decision.message;
            }
            _ => {
                return Err(PendingError::BadRequest(
                    "decision must be approved or rejected".to_string(),
                ));
            }
        }

        Ok(request.clone())
    }
}
