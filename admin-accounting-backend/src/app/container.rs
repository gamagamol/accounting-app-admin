use std::sync::Arc;

use anyhow::{Result, bail};
use redis::Client;
use sqlx::PgPool;

use crate::app::user::repo::{MemoryUserRepository, PostgresUserRepository};
use crate::config::Config;
use crate::core::user::interfaces::UserRepository;
use crate::infra::{cache, database};

pub struct Container {
    pub config: Arc<Config>,
    pub db: Option<PgPool>,
    pub redis: Option<Client>,
    pub user_repo: Arc<dyn UserRepository>,
}

impl Container {
    pub async fn new(config: Arc<Config>) -> Result<Self> {
        let (db, user_repo): (Option<PgPool>, Arc<dyn UserRepository>) =
            match config.db_driver.as_str() {
                "postgres" => {
                    let pool = database::new_postgres_pool(&config).await?;
                    let repo = Arc::new(PostgresUserRepository::new(pool.clone()));
                    (Some(pool), repo)
                }
                "memory" => {
                    tracing::warn!(
                        "using in-memory user repository; data resets when the service restarts"
                    );
                    (None, Arc::new(MemoryUserRepository::new()))
                }
                other => bail!("unsupported DB_DRIVER value: {other}"),
            };

        let redis = cache::new_redis_client(&config).await?;

        Ok(Self {
            config,
            db,
            redis,
            user_repo,
        })
    }
}
