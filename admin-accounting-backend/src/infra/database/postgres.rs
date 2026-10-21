use std::time::Duration;

use anyhow::{Context, Result, bail};
use sqlx::PgPool;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions, PgSslMode};

use crate::config::Config;

/// Opens the Postgres pool and applies embedded SQL migrations.
pub async fn new_postgres_pool(config: &Config) -> Result<PgPool> {
    let ssl_mode = match config.db_sslmode.as_str() {
        "disable" => PgSslMode::Disable,
        "allow" => PgSslMode::Allow,
        "prefer" => PgSslMode::Prefer,
        "require" => PgSslMode::Require,
        "verify-ca" => PgSslMode::VerifyCa,
        "verify-full" => PgSslMode::VerifyFull,
        other => bail!("unsupported DB_SSLMODE value: {other}"),
    };

    let options = PgConnectOptions::new()
        .host(&config.db_host)
        .port(config.db_port)
        .database(&config.db_name)
        .username(&config.db_user)
        .password(&config.db_password)
        .ssl_mode(ssl_mode);

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(5))
        .connect_with(options)
        .await
        .context("connect to postgres")?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .context("run postgres migrations")?;

    tracing::info!(
        host = %config.db_host,
        port = config.db_port,
        database = %config.db_name,
        "connected to postgres"
    );

    Ok(pool)
}
