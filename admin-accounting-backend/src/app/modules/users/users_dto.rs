use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::users_entity::User;

#[derive(Debug, Deserialize)]
pub struct CreateUserDto {
    pub name: String,
    pub email: String,
    pub role: String,
    #[serde(default)]
    pub avatar: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserDto {
    pub name: Option<String>,
    pub email: Option<String>,
    pub role: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListUsersQuery {
    pub search: Option<String>,
    pub role: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub avatar: String,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(model: User) -> Self {
        Self {
            id: model.id,
            name: model.name,
            email: model.email,
            role: model.role,
            avatar: model.avatar,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
