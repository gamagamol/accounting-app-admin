use async_trait::async_trait;

use crate::core::user::entities::UserError;
use crate::core::user::usecases::dto::{
    CreateUserRequest, ListUsersRequest, ListUsersResult, UpdateUserRequest, UserResponse,
};

#[async_trait]
pub trait UserUsecase: Send + Sync {
    async fn list(&self, request: ListUsersRequest) -> Result<ListUsersResult, UserError>;
    async fn get(&self, id: String) -> Result<UserResponse, UserError>;
    async fn create(&self, request: CreateUserRequest) -> Result<UserResponse, UserError>;
    async fn update(
        &self,
        id: String,
        request: UpdateUserRequest,
    ) -> Result<UserResponse, UserError>;
    async fn delete(&self, id: String) -> Result<(), UserError>;
}
