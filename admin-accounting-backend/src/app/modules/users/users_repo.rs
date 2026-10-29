use async_trait::async_trait;
use redis::AsyncCommands;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, Condition, DatabaseConnection, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, Set,
};

use super::users_entity::{ActiveModel, Column, Entity, User, UserFilter};
use super::users_interfaces::IUserRepo;
use crate::pkg::constans::redis_constants::REDIS_DEFAULT_TTL_SECS;
use crate::pkg::constans::user_module_constants::USER_CACHE_PREFIX;
use crate::pkg::types::Id;

/// Repository users.
///
/// - `db`    : PostgreSQL, sumber data utama.
/// - `redis` : cache, untuk mempercepat baca.
///
/// Keduanya wajib ada. Kalau Redis error saat runtime, operasi DB tetap jalan
/// dan error cache hanya dicatat di log.
pub struct UsersRepo {
    db: DatabaseConnection,
    redis: redis::Client,
}

impl UsersRepo {
    pub fn new(db: DatabaseConnection, redis: redis::Client) -> Self {
        Self { db, redis }
    }

    fn cache_key(id: &str) -> String {
        format!("{}:{}", USER_CACHE_PREFIX, id)
    }

    async fn redis_conn(&self) -> Result<redis::aio::MultiplexedConnection, String> {
        self.redis
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| e.to_string())
    }

    /// Ambil user dari cache Redis. `None` berarti cache miss / Redis error.
    async fn get_cache(&self, id: &str) -> Option<User> {
        let mut conn = match self.redis_conn().await {
            Ok(conn) => conn,
            Err(err) => {
                tracing::warn!(error = %err, "redis connection failed, skip cache");
                return None;
            }
        };

        let json: Option<String> = match conn.get(Self::cache_key(id)).await {
            Ok(json) => json,
            Err(err) => {
                tracing::warn!(error = %err, "redis get failed, skip cache");
                return None;
            }
        };

        json.and_then(|json| serde_json::from_str(&json).ok())
    }

    /// Simpan user ke cache Redis (error cache tidak menggagalkan request).
    async fn set_cache(&self, user: &User) {
        let mut conn = match self.redis_conn().await {
            Ok(conn) => conn,
            Err(err) => {
                tracing::warn!(error = %err, "redis connection failed, skip cache");
                return;
            }
        };

        let Ok(json) = serde_json::to_string(user) else {
            return;
        };

        let result: redis::RedisResult<()> = conn
            .set_ex(Self::cache_key(&user.id), json, REDIS_DEFAULT_TTL_SECS)
            .await;

        if let Err(err) = result {
            tracing::warn!(error = %err, "redis set failed, skip cache");
        }
    }

    /// Hapus user dari cache Redis.
    async fn delete_cache(&self, id: &str) {
        let mut conn = match self.redis_conn().await {
            Ok(conn) => conn,
            Err(err) => {
                tracing::warn!(error = %err, "redis connection failed, skip cache");
                return;
            }
        };

        let result: redis::RedisResult<()> = conn.del(Self::cache_key(id)).await;

        if let Err(err) = result {
            tracing::warn!(error = %err, "redis delete failed, skip cache");
        }
    }
}

#[async_trait]
impl IUserRepo for UsersRepo {
    async fn find_all(&self, filter: UserFilter) -> Result<(Vec<User>, u64), String> {
        let mut query = Entity::find();

        if let Some(search) = filter.search.as_deref() {
            let term = format!("%{}%", search.to_lowercase());
            query = query.filter(
                Condition::any()
                    .add(Column::Name.contains(&term))
                    .add(Column::Email.contains(&term)),
            );
        }

        if let Some(role) = filter.role.as_deref() {
            query = query.filter(Column::Role.eq(role));
        }

        let paginator = query
            .order_by_desc(Column::CreatedAt)
            .paginate(&self.db, filter.limit.max(1));

        let total = paginator.num_items().await.map_err(|e| e.to_string())?;
        let items = paginator
            .fetch_page(filter.page.saturating_sub(1))
            .await
            .map_err(|e| e.to_string())?;

        Ok((items, total))
    }

    /// Cache-aside:
    /// 1. Cek Redis dulu.
    /// 2. Kalau tidak ada, ambil dari PostgreSQL.
    /// 3. Simpan hasilnya ke Redis supaya request berikutnya cepat.
    async fn find_by_id(&self, id: &Id) -> Result<Option<User>, String> {
        if let Some(user) = self.get_cache(id.as_str()).await {
            return Ok(Some(user));
        }

        let user = Entity::find_by_id(id.as_str())
            .one(&self.db)
            .await
            .map_err(|e| e.to_string())?;

        if let Some(user) = &user {
            self.set_cache(user).await;
        }

        Ok(user)
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, String> {
        Entity::find()
            .filter(Column::Email.eq(email))
            .one(&self.db)
            .await
            .map_err(|e| e.to_string())
    }

    async fn create(&self, user: &User) -> Result<User, String> {
        let active = ActiveModel {
            id: Set(user.id.clone()),
            name: Set(user.name.clone()),
            email: Set(user.email.clone()),
            role: Set(user.role.clone()),
            avatar: Set(user.avatar.clone()),
            created_at: Set(user.created_at),
            updated_at: Set(user.updated_at),
        };

        let created = active.insert(&self.db).await.map_err(|e| e.to_string())?;
        self.set_cache(&created).await;
        Ok(created)
    }

    async fn update(&self, user: &User) -> Result<User, String> {
        let active = ActiveModel {
            id: Set(user.id.clone()),
            name: Set(user.name.clone()),
            email: Set(user.email.clone()),
            role: Set(user.role.clone()),
            avatar: Set(user.avatar.clone()),
            created_at: Set(user.created_at),
            updated_at: Set(user.updated_at),
        };

        let updated = active.update(&self.db).await.map_err(|e| e.to_string())?;
        self.set_cache(&updated).await;
        Ok(updated)
    }

    async fn delete(&self, id: &Id) -> Result<bool, String> {
        self.delete_cache(id.as_str()).await;

        let result = Entity::delete_by_id(id.as_str())
            .exec(&self.db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(result.rows_affected > 0)
    }
}
