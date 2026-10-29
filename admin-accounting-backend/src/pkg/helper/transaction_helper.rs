use anyhow::Result;
use sea_orm::{DatabaseConnection, DatabaseTransaction, TransactionTrait};

pub async fn begin_tx(db: &DatabaseConnection) -> Result<DatabaseTransaction> {
    db.begin()
        .await
        .map_err(|e| anyhow::anyhow!("failed to begin transaction: {e}"))
}
