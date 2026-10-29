use async_trait::async_trait;

use super::users_dto::{CreateUserDto, ListUsersQuery, UpdateUserDto, UserResponse};
use super::users_entity::{User, UserFilter};
use super::users_error::UserError;
use crate::pkg::response::response_success::PaginationMeta;
use crate::pkg::types::Id;

/// Kontrak untuk lapisan repository (akses data).
#[async_trait]
pub trait IUserRepo: Send + Sync {
    async fn find_all(&self, filter: UserFilter) -> Result<(Vec<User>, u64), String>;
    async fn find_by_id(&self, id: &Id) -> Result<Option<User>, String>;
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, String>;
    async fn create(&self, user: &User) -> Result<User, String>;
    async fn update(&self, user: &User) -> Result<User, String>;
    async fn delete(&self, id: &Id) -> Result<bool, String>;
}

/// Kontrak untuk lapisan usecase (logika bisnis).
#[async_trait]
pub trait IUserUsecase: Send + Sync {
    async fn list(
        &self,
        query: ListUsersQuery,
    ) -> Result<(Vec<UserResponse>, PaginationMeta), UserError>;
    async fn get_by_id(&self, id: &str) -> Result<UserResponse, UserError>;
    async fn create(&self, dto: CreateUserDto) -> Result<UserResponse, UserError>;
    async fn update(&self, id: &str, dto: UpdateUserDto) -> Result<UserResponse, UserError>;
    async fn delete(&self, id: &str) -> Result<(), UserError>;
}
