use async_trait::async_trait;

use crate::core::user::entities::{User, UserError};

#[derive(Debug, Clone, Default)]
pub struct UserFilter {
    pub search: Option<String>,
    pub role: Option<String>,
    pub offset: i64,
    pub limit: i64,
}

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn list(&self, filter: UserFilter) -> Result<(Vec<User>, i64), UserError>;
    async fn get_by_id(&self, id: &str) -> Result<User, UserError>;
    async fn get_by_email(&self, email: &str) -> Result<Option<User>, UserError>;
    async fn create(&self, user: &User) -> Result<(), UserError>;
    async fn update(&self, user: &User) -> Result<(), UserError>;
    async fn delete(&self, id: &str) -> Result<(), UserError>;
}
