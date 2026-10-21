use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

pub const ROLE_SUPER_ADMIN: &str = "SUPER_ADMIN";
pub const ROLE_SALES_ADMIN: &str = "SALES_ADMIN";
pub const ROLE_ACCOUNTING_ADMIN: &str = "ACCOUNTING_ADMIN";
pub const ROLE_OWNER: &str = "OWNER";

pub const VALID_ROLES: [&str; 4] = [
    ROLE_SUPER_ADMIN,
    ROLE_SALES_ADMIN,
    ROLE_ACCOUNTING_ADMIN,
    ROLE_OWNER,
];

pub fn is_valid_role(role: &str) -> bool {
    VALID_ROLES.contains(&role)
}

/// Core user entity. The API response DTO keeps the frontend-compatible
/// camelCase field names while this entity stays persistence-oriented.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub avatar: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
