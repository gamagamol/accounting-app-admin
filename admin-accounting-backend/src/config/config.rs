use std::env;
use std::fmt::Display;
use std::str::FromStr;

use anyhow::{Result, bail};

/// Runtime configuration loaded from environment variables.
///
/// `DB_DRIVER=memory` is the default so the users CRUD can run before
/// Postgres and Redis are available.
#[derive(Debug, Clone)]
pub struct Config {
    pub app_name: String,
    pub app_env: String,
    pub app_port: u16,

    pub db_driver: String,
    pub db_host: String,
    pub db_port: u16,
    pub db_name: String,
    pub db_user: String,
    pub db_password: String,
    pub db_sslmode: String,

    pub redis_enabled: bool,
    pub redis_host: String,
    pub redis_port: u16,
    pub redis_password: String,
    pub redis_db: i64,

    pub log_level: String,
    pub log_format: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            app_name: "admin-accounting-backend".to_string(),
            app_env: "development".to_string(),
            app_port: 8080,

            db_driver: "memory".to_string(),
            db_host: "localhost".to_string(),
            db_port: 5432,
            db_name: "admin_accounting".to_string(),
            db_user: "postgres".to_string(),
            db_password: "postgres".to_string(),
            db_sslmode: "disable".to_string(),

            redis_enabled: false,
            redis_host: "localhost".to_string(),
            redis_port: 6379,
            redis_password: String::new(),
            redis_db: 0,

            log_level: "info".to_string(),
            log_format: "json".to_string(),
        }
    }
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let _ = dotenvy::dotenv();

        let defaults = Self::default();
        let config = Self {
            app_name: env_or("APP_NAME", &defaults.app_name),
            app_env: env_or("APP_ENV", &defaults.app_env),
            app_port: env_parse("APP_PORT", defaults.app_port)?,

            db_driver: env_or("DB_DRIVER", &defaults.db_driver).to_lowercase(),
            db_host: env_or("DB_HOST", &defaults.db_host),
            db_port: env_parse("DB_PORT", defaults.db_port)?,
            db_name: env_or("DB_NAME", &defaults.db_name),
            db_user: env_or("DB_USER", &defaults.db_user),
            db_password: env_or("DB_PASSWORD", &defaults.db_password),
            db_sslmode: env_or("DB_SSLMODE", &defaults.db_sslmode).to_lowercase(),

            redis_enabled: env_parse("REDIS_ENABLED", defaults.redis_enabled)?,
            redis_host: env_or("REDIS_HOST", &defaults.redis_host),
            redis_port: env_parse("REDIS_PORT", defaults.redis_port)?,
            redis_password: env_or("REDIS_PASSWORD", &defaults.redis_password),
            redis_db: env_parse("REDIS_DB", defaults.redis_db)?,

            log_level: env_or("LOG_LEVEL", &defaults.log_level).to_lowercase(),
            log_format: env_or("LOG_FORMAT", &defaults.log_format).to_lowercase(),
        };

        if !matches!(config.db_driver.as_str(), "memory" | "postgres") {
            bail!("DB_DRIVER must be either memory or postgres");
        }

        if !matches!(config.log_format.as_str(), "json" | "text") {
            bail!("LOG_FORMAT must be either json or text");
        }

        match config.app_port {
            1..=65535 => {}
            _ => bail!("APP_PORT must be between 1 and 65535"),
        }

        Ok(config)
    }

    pub fn is_postgres(&self) -> bool {
        self.db_driver == "postgres"
    }

    pub fn redis_url(&self) -> String {
        if self.redis_password.is_empty() {
            format!(
                "redis://{}:{}/{}",
                self.redis_host, self.redis_port, self.redis_db
            )
        } else {
            format!(
                "redis://:{}@{}:{}/{}",
                self.redis_password, self.redis_host, self.redis_port, self.redis_db
            )
        }
    }
}

fn env_or(key: &str, fallback: &str) -> String {
    env::var(key)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| fallback.to_string())
}

fn env_parse<T>(key: &str, fallback: T) -> Result<T>
where
    T: FromStr,
    T::Err: Display,
{
    match env::var(key) {
        Ok(value) if !value.trim().is_empty() => value
            .trim()
            .parse::<T>()
            .map_err(|error| anyhow::anyhow!("invalid value for {key}: {error}")),
        _ => Ok(fallback),
    }
}
