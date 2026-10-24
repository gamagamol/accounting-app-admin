use std::sync::Arc;

use anyhow::{Result, bail};
use mongodb::Database;
use redis::Client;
use sqlx::PgPool;

use crate::app::audit::repo::{MemoryAuditRepository, MongoAuditRepository};
use crate::app::pending::repo::{MemoryPendingRepository, PostgresPendingRepository};
use crate::app::user::repo::{MemoryUserRepository, PostgresUserRepository};
use crate::config::Config;
use crate::core::audit::interfaces::AuditRepository;
use crate::core::pending::interfaces::PendingRepository;
use crate::core::user::interfaces::UserRepository;
use crate::infra::{cache, database};

pub struct Container {
    pub config: Arc<Config>,
    pub db: Option<PgPool>,
    pub redis: Option<Client>,
    pub mongo: Option<Database>,
    pub user_repo: Arc<dyn UserRepository>,
    pub audit_repo: Arc<dyn AuditRepository>,
    pub pending_repo: Arc<dyn PendingRepository>,
}

impl Container {
    pub async fn new(config: Arc<Config>) -> Result<Self> {
        let (db, user_repo, pending_repo): (
            Option<PgPool>,
            Arc<dyn UserRepository>,
            Arc<dyn PendingRepository>,
        ) = match config.db_driver.as_str() {
            "postgres" => {
                let pool = database::new_postgres_pool(&config).await?;
                let user_repo = Arc::new(PostgresUserRepository::new(pool.clone()));
                let pending_repo = Arc::new(PostgresPendingRepository::new(pool.clone()));
                (Some(pool), user_repo, pending_repo)
            }
            "memory" => {
                tracing::warn!(
                    "using in-memory user and pending repositories; data resets when the service restarts"
                );
                (
                    None,
                    Arc::new(MemoryUserRepository::new()),
                    Arc::new(MemoryPendingRepository::new()),
                )
            }
            other => bail!("unsupported DB_DRIVER value: {other}"),
        };

        let redis = cache::new_redis_client(&config).await?;
        let mongo = database::new_mongo_database(&config).await?;

        let audit_repo: Arc<dyn AuditRepository> = match mongo.as_ref() {
            Some(database) => Arc::new(
                MongoAuditRepository::new(database.clone(), &config.mongo_audit_collection).await?,
            ),
            None => {
                tracing::warn!(
                    "using in-memory audit repository; set MONGO_ENABLED=true to persist audit events in MongoDB"
                );
                Arc::new(MemoryAuditRepository::new())
            }
        };

        Ok(Self {
            config,
            db,
            redis,
            mongo,
            user_repo,
            audit_repo,
            pending_repo,
        })
    }
}
