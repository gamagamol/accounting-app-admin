use std::time::Duration;

use anyhow::{Context, Result};
use mongodb::bson::doc;
use mongodb::options::ClientOptions;
use mongodb::{Client, Database};

use crate::config::Config;

/// Opens the MongoDB client used by the audit trail.
///
/// MongoDB is optional for local unit tests. When `MONGO_ENABLED=true` the
/// connection is verified at startup so the service fails fast if the audit
/// store is unreachable.
pub async fn new_mongo_database(config: &Config) -> Result<Option<Database>> {
    if !config.mongo_enabled {
        tracing::info!("mongodb is disabled");
        return Ok(None);
    }

    let mut options = ClientOptions::parse(&config.mongo_uri)
        .await
        .context("parse mongodb uri")?;
    options.app_name = Some(config.app_name.clone());
    options.server_selection_timeout = Some(Duration::from_secs(5));

    let client = Client::with_options(options).context("create mongodb client")?;
    let database = client.database(&config.mongo_database);

    database
        .run_command(doc! { "ping": 1 })
        .await
        .context("ping mongodb")?;

    tracing::info!(
        database = %config.mongo_database,
        collection = %config.mongo_audit_collection,
        "connected to mongodb"
    );

    Ok(Some(database))
}
