use std::sync::Arc;

use async_trait::async_trait;
use chrono::Utc;
use uuid::Uuid;

use crate::core::user::entities::{User, UserError, is_valid_role};
use crate::core::user::interfaces::{UserFilter, UserRepository, UserUsecase};
use crate::core::user::usecases::dto::{
    CreateUserRequest, ListUsersRequest, ListUsersResult, UpdateUserRequest, UserResponse,
};
use crate::pkg::validator::validate;

pub struct UserUsecaseImpl {
    repo: Arc<dyn UserRepository>,
}

impl UserUsecaseImpl {
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl UserUsecase for UserUsecaseImpl {
    async fn list(&self, request: ListUsersRequest) -> Result<ListUsersResult, UserError> {
        let (page, limit) = normalize_pagination(request.page, request.limit);

        let role = request
            .role
            .map(|role| role.trim().to_uppercase())
            .filter(|role| !role.is_empty());

        if let Some(role) = role.as_deref()
            && !is_valid_role(role)
        {
            return Err(UserError::InvalidRole);
        }

        let search = request
            .search
            .map(|search| search.trim().to_string())
            .filter(|search| !search.is_empty());

        let (users, total) = self
            .repo
            .list(UserFilter {
                search,
                role,
                offset: i64::from(page.saturating_sub(1)) * i64::from(limit),
                limit: i64::from(limit),
            })
            .await?;

        Ok(ListUsersResult {
            items: users.into_iter().map(UserResponse::from).collect(),
            total,
            page,
            limit,
        })
    }

    async fn get(&self, id: String) -> Result<UserResponse, UserError> {
        let id = id.trim();
        if id.is_empty() {
            return Err(UserError::NotFound);
        }

        let user = self.repo.get_by_id(id).await?;
        Ok(UserResponse::from(user))
    }

    async fn create(&self, request: CreateUserRequest) -> Result<UserResponse, UserError> {
        let request = normalize_create_request(request);
        validate(&request).map_err(UserError::Validation)?;

        if !is_valid_role(&request.role) {
            return Err(UserError::InvalidRole);
        }

        if self.repo.get_by_email(&request.email).await?.is_some() {
            return Err(UserError::EmailExists);
        }

        let now = Utc::now();
        let user = User {
            id: Uuid::new_v4().to_string(),
            name: request.name,
            email: request.email,
            role: request.role,
            avatar: request.avatar,
            created_at: now,
            updated_at: now,
        };

        self.repo.create(&user).await?;

        tracing::info!(
            user_id = %user.id,
            email = %user.email,
            role = %user.role,
            "user created"
        );

        Ok(UserResponse::from(user))
    }

    async fn update(
        &self,
        id: String,
        request: UpdateUserRequest,
    ) -> Result<UserResponse, UserError> {
        let id = id.trim();
        if id.is_empty() {
            return Err(UserError::NotFound);
        }

        let request = normalize_update_request(request);
        validate(&request).map_err(UserError::Validation)?;

        if !is_valid_role(&request.role) {
            return Err(UserError::InvalidRole);
        }

        let mut user = self.repo.get_by_id(id).await?;

        if let Some(existing) = self.repo.get_by_email(&request.email).await?
            && existing.id != id
        {
            return Err(UserError::EmailExists);
        }

        user.name = request.name;
        user.email = request.email;
        user.role = request.role;
        user.avatar = request.avatar;
        user.updated_at = Utc::now();

        self.repo.update(&user).await?;

        tracing::info!(
            user_id = %user.id,
            email = %user.email,
            role = %user.role,
            "user updated"
        );

        Ok(UserResponse::from(user))
    }

    async fn delete(&self, id: String) -> Result<(), UserError> {
        let id = id.trim();
        if id.is_empty() {
            return Err(UserError::NotFound);
        }

        self.repo.delete(id).await?;
        tracing::info!(user_id = %id, "user deleted");
        Ok(())
    }
}

fn normalize_create_request(request: CreateUserRequest) -> CreateUserRequest {
    CreateUserRequest {
        name: request.name.trim().to_string(),
        email: request.email.trim().to_lowercase(),
        role: request.role.trim().to_uppercase(),
        avatar: request.avatar.trim().to_string(),
    }
}

fn normalize_update_request(request: UpdateUserRequest) -> UpdateUserRequest {
    UpdateUserRequest {
        name: request.name.trim().to_string(),
        email: request.email.trim().to_lowercase(),
        role: request.role.trim().to_uppercase(),
        avatar: request.avatar.trim().to_string(),
    }
}

fn normalize_pagination(page: u32, limit: u32) -> (u32, u32) {
    let page = if page == 0 { 1 } else { page };
    let limit = if limit == 0 { 10 } else { limit.min(100) };
    (page, limit)
}
