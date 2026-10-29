use std::sync::Arc;

use async_trait::async_trait;

use super::users_dto::{CreateUserDto, ListUsersQuery, UpdateUserDto, UserResponse};
use super::users_entity::{User, UserFilter};
use super::users_error::UserError;
use super::users_interfaces::{IUserRepo, IUserUsecase};
use crate::pkg::constans::constants::{DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE};
use crate::pkg::helper::time::now;
use crate::pkg::response::response_success::PaginationMeta;
use crate::pkg::types::Id;

pub struct UserUsecase {
    repo: Arc<dyn IUserRepo>,
}

impl UserUsecase {
    pub fn new(repo: Arc<dyn IUserRepo>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl IUserUsecase for UserUsecase {
    async fn list(
        &self,
        query: ListUsersQuery,
    ) -> Result<(Vec<UserResponse>, PaginationMeta), UserError> {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);

        let filter = UserFilter {
            search: query.search,
            role: query.role,
            page,
            limit,
        };

        let (users, total) = self
            .repo
            .find_all(filter)
            .await
            .map_err(UserError::Repository)?;

        let meta = PaginationMeta::new(page, limit, total);
        let responses = users.into_iter().map(UserResponse::from).collect();

        Ok((responses, meta))
    }

    async fn get_by_id(&self, id: &str) -> Result<UserResponse, UserError> {
        let user = self
            .repo
            .find_by_id(&Id::new(id))
            .await
            .map_err(UserError::Repository)?
            .ok_or(UserError::NotFound)?;

        Ok(UserResponse::from(user))
    }

    async fn create(&self, dto: CreateUserDto) -> Result<UserResponse, UserError> {
        // Aturan bisnis: email tidak boleh sudah terdaftar.
        if self
            .repo
            .find_by_email(&dto.email)
            .await
            .map_err(UserError::Repository)?
            .is_some()
        {
            return Err(UserError::EmailExists);
        }

        let current_time = now();
        let new_user = User {
            id: Id::generate().0,
            name: dto.name,
            email: dto.email,
            role: dto.role,
            avatar: dto.avatar,
            created_at: current_time,
            updated_at: current_time,
        };

        let created = self
            .repo
            .create(&new_user)
            .await
            .map_err(UserError::Repository)?;

        Ok(UserResponse::from(created))
    }

    async fn update(&self, id: &str, dto: UpdateUserDto) -> Result<UserResponse, UserError> {
        let mut user = self
            .repo
            .find_by_id(&Id::new(id))
            .await
            .map_err(UserError::Repository)?
            .ok_or(UserError::NotFound)?;

        if let Some(name) = dto.name {
            user.name = name;
        }

        if let Some(email) = dto.email {
            // Aturan bisnis: email baru tidak boleh milik user lain.
            if email != user.email {
                if self
                    .repo
                    .find_by_email(&email)
                    .await
                    .map_err(UserError::Repository)?
                    .is_some()
                {
                    return Err(UserError::EmailExists);
                }
                user.email = email;
            }
        }

        if let Some(role) = dto.role {
            user.role = role;
        }

        if let Some(avatar) = dto.avatar {
            user.avatar = avatar;
        }

        user.updated_at = now();

        let updated = self
            .repo
            .update(&user)
            .await
            .map_err(UserError::Repository)?;

        Ok(UserResponse::from(updated))
    }

    async fn delete(&self, id: &str) -> Result<(), UserError> {
        let deleted = self
            .repo
            .delete(&Id::new(id))
            .await
            .map_err(UserError::Repository)?;

        if !deleted {
            return Err(UserError::NotFound);
        }

        Ok(())
    }
}
