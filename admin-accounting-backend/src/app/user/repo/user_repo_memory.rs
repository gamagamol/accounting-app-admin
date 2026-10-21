use std::collections::HashMap;
use std::sync::RwLock;

use async_trait::async_trait;
use chrono::{Duration, Utc};

use crate::core::user::entities::{
    ROLE_ACCOUNTING_ADMIN, ROLE_OWNER, ROLE_SALES_ADMIN, ROLE_SUPER_ADMIN, User, UserError,
};
use crate::core::user::interfaces::{UserFilter, UserRepository};

/// Seeded in-memory repository used by default for local CRUD development.
pub struct MemoryUserRepository {
    users: RwLock<HashMap<String, User>>,
}

impl MemoryUserRepository {
    pub fn new() -> Self {
        let now = Utc::now();
        let seed = vec![
            User {
                id: "usr-001".to_string(),
                name: "Ahmad Fauzi".to_string(),
                email: "ahmad.fauzi@byond.co.id".to_string(),
                role: ROLE_SUPER_ADMIN.to_string(),
                avatar: String::new(),
                created_at: now - Duration::minutes(4),
                updated_at: now - Duration::minutes(4),
            },
            User {
                id: "usr-002".to_string(),
                name: "Siti Aminah".to_string(),
                email: "siti.aminah@byond.co.id".to_string(),
                role: ROLE_SALES_ADMIN.to_string(),
                avatar: String::new(),
                created_at: now - Duration::minutes(3),
                updated_at: now - Duration::minutes(3),
            },
            User {
                id: "usr-003".to_string(),
                name: "Bambang Soepomo".to_string(),
                email: "bambang.s@byond.co.id".to_string(),
                role: ROLE_ACCOUNTING_ADMIN.to_string(),
                avatar: String::new(),
                created_at: now - Duration::minutes(2),
                updated_at: now - Duration::minutes(2),
            },
            User {
                id: "usr-004".to_string(),
                name: "Dewi Sartika".to_string(),
                email: "dewi.sartika@byond.co.id".to_string(),
                role: ROLE_OWNER.to_string(),
                avatar: String::new(),
                created_at: now - Duration::minutes(1),
                updated_at: now - Duration::minutes(1),
            },
        ];

        let users = seed
            .into_iter()
            .map(|user| (user.id.clone(), user))
            .collect();

        Self {
            users: RwLock::new(users),
        }
    }

    fn read_users(&self) -> std::sync::RwLockReadGuard<'_, HashMap<String, User>> {
        self.users
            .read()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }

    fn write_users(&self) -> std::sync::RwLockWriteGuard<'_, HashMap<String, User>> {
        self.users
            .write()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }
}

impl Default for MemoryUserRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl UserRepository for MemoryUserRepository {
    async fn list(&self, filter: UserFilter) -> Result<(Vec<User>, i64), UserError> {
        let users = self.read_users();
        let search = filter.search.as_deref().map(str::to_lowercase);

        let mut items: Vec<User> = users
            .values()
            .filter(|user| {
                if let Some(role) = filter.role.as_deref()
                    && user.role != role
                {
                    return false;
                }

                if let Some(search) = search.as_deref() {
                    let haystack = format!("{} {}", user.name, user.email).to_lowercase();
                    if !haystack.contains(search) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect();

        items.sort_by_key(|left| std::cmp::Reverse(left.created_at));

        let total = items.len() as i64;
        let start = filter.offset.max(0) as usize;
        let limit = filter.limit.max(0) as usize;
        let end = start.saturating_add(limit).min(items.len());

        let items = if start < items.len() {
            items[start..end].to_vec()
        } else {
            Vec::new()
        };

        Ok((items, total))
    }

    async fn get_by_id(&self, id: &str) -> Result<User, UserError> {
        self.read_users()
            .get(id)
            .cloned()
            .ok_or(UserError::NotFound)
    }

    async fn get_by_email(&self, email: &str) -> Result<Option<User>, UserError> {
        Ok(self
            .read_users()
            .values()
            .find(|user| user.email.eq_ignore_ascii_case(email))
            .cloned())
    }

    async fn create(&self, user: &User) -> Result<(), UserError> {
        let mut users = self.write_users();

        if users
            .values()
            .any(|existing| existing.email.eq_ignore_ascii_case(&user.email))
        {
            return Err(UserError::EmailExists);
        }

        users.insert(user.id.clone(), user.clone());
        Ok(())
    }

    async fn update(&self, user: &User) -> Result<(), UserError> {
        let mut users = self.write_users();

        if !users.contains_key(&user.id) {
            return Err(UserError::NotFound);
        }

        if users.values().any(|existing| {
            existing.id != user.id && existing.email.eq_ignore_ascii_case(&user.email)
        }) {
            return Err(UserError::EmailExists);
        }

        users.insert(user.id.clone(), user.clone());
        Ok(())
    }

    async fn delete(&self, id: &str) -> Result<(), UserError> {
        if self.write_users().remove(id).is_none() {
            return Err(UserError::NotFound);
        }
        Ok(())
    }
}
