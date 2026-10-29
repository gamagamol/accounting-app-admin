use anyhow::Result;

use crate::pkg::constans::mongo_constants::MONGO_AUDIT_LOG_COLLECTION;

#[derive(Debug, Clone)]
pub struct Config {
    pub app_name: String,
    pub app_env: String,
    pub app_port: u16,

    pub db_url: String,
    pub db_host: String,
    pub db_port: u16,
    pub db_name: String,
    pub db_user: String,
    pub db_password: String,
    pub db_sslmode: String,

    pub redis_url: String,
    pub redis_host: String,
    pub redis_port: u16,
    pub redis_password: String,
    pub redis_db: i64,

    pub mongo_uri: String,
    pub mongo_database: String,
    pub mongo_audit_collection: String,

    pub jwt_secret: String,
    pub log_level: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            app_name: "admin-accounting-backend".to_string(),
            app_env: "development".to_string(),
            app_port: 8080,

            db_url:
                "postgres://postgres:postgres@localhost:5432/accounting_admin_db?sslmode=disable"
                    .to_string(),
            db_host: "localhost".to_string(),
            db_port: 5432,
            db_name: "accounting_admin_db".to_string(),
            db_user: "postgres".to_string(),
            db_password: "postgres".to_string(),
            db_sslmode: "disable".to_string(),

            redis_url: "redis://127.0.0.1:6379/0".to_string(),
            redis_host: "127.0.0.1".to_string(),
            redis_port: 6379,
            redis_password: String::new(),
            redis_db: 0,

            mongo_uri: "mongodb://127.0.0.1:27017".to_string(),
            mongo_database: "admin_accounting".to_string(),
            mongo_audit_collection: MONGO_AUDIT_LOG_COLLECTION.to_string(),

            jwt_secret: String::new(),
            log_level: "info".to_string(),
        }
    }
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let _ = dotenvy::dotenv();

        let app_name =
            std::env::var("APP_NAME").unwrap_or_else(|_| "admin-accounting-backend".to_string());
        let app_env = std::env::var("APP_ENV").unwrap_or_else(|_| "development".to_string());
        let app_port = std::env::var("APP_PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8080);

        let db_host = std::env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string());
        let db_port = std::env::var("DB_PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(5432);
        let db_name =
            std::env::var("DB_NAME").unwrap_or_else(|_| "accounting_admin_db".to_string());
        let db_user = std::env::var("DB_USER").unwrap_or_else(|_| "postgres".to_string());
        let db_password = std::env::var("DB_PASSWORD").unwrap_or_else(|_| "postgres".to_string());
        let db_sslmode = std::env::var("DB_SSLMODE").unwrap_or_else(|_| "disable".to_string());

        let db_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
            format!(
                "postgres://{}:{}@{}:{}/{}?sslmode={}",
                db_user, db_password, db_host, db_port, db_name, db_sslmode
            )
        });

        let redis_host = std::env::var("REDIS_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let redis_port = std::env::var("REDIS_PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(6379);
        let redis_password = std::env::var("REDIS_PASSWORD").unwrap_or_default();
        let redis_db = std::env::var("REDIS_DB")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(0);

        let redis_url = if redis_password.is_empty() {
            format!("redis://{}:{}/{}", redis_host, redis_port, redis_db)
        } else {
            format!(
                "redis://:{}@{}:{}/{}",
                redis_password, redis_host, redis_port, redis_db
            )
        };

        let mongo_uri =
            std::env::var("MONGO_URI").unwrap_or_else(|_| "mongodb://127.0.0.1:27017".to_string());
        let mongo_database =
            std::env::var("MONGO_DATABASE").unwrap_or_else(|_| "admin_accounting".to_string());
        let mongo_audit_collection = std::env::var("MONGO_AUDIT_COLLECTION")
            .unwrap_or_else(|_| MONGO_AUDIT_LOG_COLLECTION.to_string());

        let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_default();
        let log_level = std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string());

        Ok(Self {
            app_name,
            app_env,
            app_port,
            db_url,
            db_host,
            db_port,
            db_name,
            db_user,
            db_password,
            db_sslmode,
            redis_url,
            redis_host,
            redis_port,
            redis_password,
            redis_db,
            mongo_uri,
            mongo_database,
            mongo_audit_collection,
            jwt_secret,
            log_level,
        })
    }
}
