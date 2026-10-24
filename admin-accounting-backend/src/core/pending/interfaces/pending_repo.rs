use async_trait::async_trait;
use uuid::Uuid;

use crate::core::pending::entities::{
    PendingDecision, PendingError, PendingFilter, PendingRequest,
};

#[async_trait]
pub trait PendingRepository: Send + Sync {
    async fn list(&self, filter: PendingFilter)
    -> Result<(Vec<PendingRequest>, i64), PendingError>;

    async fn get_by_id(
        &self,
        transaction_type: &str,
        id: Uuid,
    ) -> Result<PendingRequest, PendingError>;

    async fn create(&self, request: &PendingRequest) -> Result<(), PendingError>;

    async fn decide(
        &self,
        transaction_type: &str,
        id: Uuid,
        decision: PendingDecision,
    ) -> Result<PendingRequest, PendingError>;
}
