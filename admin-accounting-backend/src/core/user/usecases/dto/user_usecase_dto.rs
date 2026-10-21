use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::core::user::entities::User;

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct CreateUserRequest {
    #[validate(length(
        min = 2,
        max = 150,
        message = "name must be between 2 and 150 characters"
    ))]
    pub name: String,

    #[validate(email(message = "email must be a valid email address"))]
    pub email: String,

    pub role: String,

    #[serde(default)]
    #[validate(length(max = 500, message = "avatar must be at most 500 characters"))]
    pub avatar: String,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct UpdateUserRequest {
    #[validate(length(
        min = 2,
        max = 150,
        message = "name must be between 2 and 150 characters"
    ))]
    pub name: String,

    #[validate(email(message = "email must be a valid email address"))]
    pub email: String,

    pub role: String,

    #[serde(default)]
    #[validate(length(max = 500, message = "avatar must be at most 500 characters"))]
    pub avatar: String,
}

#[derive(Debug, Clone, Default)]
pub struct ListUsersRequest {
    pub search: Option<String>,
    pub role: Option<String>,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub avatar: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ListUsersResult {
    pub items: Vec<UserResponse>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PageMeta {
    pub page: u32,
    pub limit: u32,
    pub total: i64,
}
