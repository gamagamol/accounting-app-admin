use async_trait::async_trait;

use crate::core::pending::entities::{PendingError, PendingRequest};
use crate::core::pending::usecases::dto::{
    CreatePendingRequest, ListPendingRequest, ListPendingResult, PendingDecisionRequest,
};

#[async_trait]
pub trait PendingUsecase: Send + Sync {
    async fn list(&self, request: ListPendingRequest) -> Result<ListPendingResult, PendingError>;

    async fn get(
        &self,
        transaction_type: String,
        id: String,
    ) -> Result<PendingRequest, PendingError>;

    async fn create(&self, request: CreatePendingRequest) -> Result<PendingRequest, PendingError>;

    async fn approve(
        &self,
        transaction_type: String,
        id: String,
        request: PendingDecisionRequest,
    ) -> Result<PendingRequest, PendingError>;

    async fn reject(
        &self,
        transaction_type: String,
        id: String,
        request: PendingDecisionRequest,
    ) -> Result<PendingRequest, PendingError>;
}
