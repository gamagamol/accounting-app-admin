use anyhow::{Context, Result, bail};
use redis::Client;

use crate::config::Config;

/// Creates and verifies the Redis connection when REDIS_ENABLED=true.
/// Returning `None` keeps local CRUD development free of an external Redis.
pub async fn new_redis_client(config: &Config) -> Result<Option<Client>> {
    if !config.redis_enabled {
        tracing::info!("redis is disabled");
        return Ok(None);
    }

    let client = Client::open(config.redis_url()).context("create redis client")?;
    let mut connection = client
        .get_multiplexed_async_connection()
        .await
        .context("connect to redis")?;

    let response: String = redis::cmd("PING")
        .query_async(&mut connection)
        .await
        .context("ping redis")?;

    if response != "PONG" {
        bail!("unexpected redis PING response: {response}");
    }

    tracing::info!(
        host = %config.redis_host,
        port = config.redis_port,
        db = config.redis_db,
        "connected to redis"
    );

    Ok(Some(client))
}
