use anyhow::{Context, Result};
use sea_orm::{ConnectOptions, Database as SeaDatabase, DatabaseConnection};
use std::time::Duration;

use super::config::Config;

/// Satu pintu untuk semua koneksi database.
/// Semua client wajib ada; kalau salah satu gagal connect, aplikasi gagal start.
pub struct Database {
    postgres: DatabaseConnection,
    redis: redis::Client,
    mongo: mongodb::Database,
}

impl Database {
    pub async fn init(config: &Config) -> Result<Self> {
        Ok(Self {
            postgres: Self::postgre_connection(config).await?,
            redis: Self::redis_connection(config).await?,
            mongo: Self::mongo_connection(config).await?,
        })
    }

    /// Client PostgreSQL (SeaORM).
    pub fn postgres_client(&self) -> DatabaseConnection {
        self.postgres.clone()
    }

    /// Pool SQLx mentah untuk modul transaksi/report yang memakai SQL langsung.
    pub fn postgres_pool(&self) -> sqlx::PgPool {
        self.postgres.get_postgres_connection_pool().clone()
    }

    /// Client Redis.
    pub fn redis_client(&self) -> redis::Client {
        self.redis.clone()
    }

    /// Client MongoDB.
    pub fn mongo_client(&self) -> mongodb::Database {
        self.mongo.clone()
    }

    pub async fn postgre_connection(config: &Config) -> Result<DatabaseConnection> {
        let mut opt = ConnectOptions::new(&config.db_url);
        opt.max_connections(20)
            .min_connections(5)
            .connect_timeout(Duration::from_secs(10))
            .acquire_timeout(Duration::from_secs(10))
            .idle_timeout(Duration::from_secs(300))
            .max_lifetime(Duration::from_secs(1800))
            .sqlx_logging(true);

        let conn = SeaDatabase::connect(opt)
            .await
            .with_context(|| format!("failed to connect to database at {}", config.db_url))?;

        tracing::info!("connected to postgres via sea-orm");
        Ok(conn)
    }

    pub async fn redis_connection(config: &Config) -> Result<redis::Client> {
        let client = redis::Client::open(config.redis_url.as_str())
            .with_context(|| format!("invalid redis connection url: {}", config.redis_url))?;

        let mut conn = client
            .get_multiplexed_async_connection()
            .await
            .with_context(|| {
                format!("failed to connect to redis server at {}", config.redis_url)
            })?;

        let pong: String = redis::cmd("PING")
            .query_async(&mut conn)
            .await
            .context("redis ping failed")?;

        tracing::info!(redis_pong = %pong, "connected to redis");
        Ok(client)
    }

    pub async fn mongo_connection(config: &Config) -> Result<mongodb::Database> {
        let client = mongodb::Client::with_uri_str(&config.mongo_uri)
            .await
            .with_context(|| format!("failed to connect to mongo at {}", config.mongo_uri))?;

        let db = client.database(&config.mongo_database);

        // MongoDB connect-nya lazy, jadi ping dulu supaya benar-benar wajib hidup.
        db.run_command(mongodb::bson::doc! { "ping": 1 })
            .await
            .with_context(|| format!("failed to ping mongo at {}", config.mongo_uri))?;

        tracing::info!(database = %config.mongo_database, "connected to mongodb");
        Ok(db)
    }
}
