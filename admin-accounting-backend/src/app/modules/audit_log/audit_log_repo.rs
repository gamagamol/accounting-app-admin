use async_trait::async_trait;
use futures_util::TryStreamExt;
use mongodb::bson::{Bson, Document, doc};
use mongodb::{Collection, Database as MongoDatabase, IndexModel};
use sea_orm::DatabaseConnection;

use super::audit_log_entity::{AuditFilter, AuditLogEntry};
use super::audit_log_interfaces::IAuditLogRepo;

pub struct AuditLogRepo {
    // Disiapkan untuk audit log di PostgreSQL.
    #[allow(dead_code)]
    postgres: DatabaseConnection,
    // Disiapkan untuk cache audit log di Redis.
    #[allow(dead_code)]
    redis: redis::Client,
    collection: Collection<AuditLogEntry>,
}

impl AuditLogRepo {
    pub async fn new(
        postgres: DatabaseConnection,
        mongo: MongoDatabase,
        redis: redis::Client,
        collection_name: &str,
    ) -> Self {
        let collection = mongo.collection::<AuditLogEntry>(collection_name);

        let mut keys = Document::new();
        keys.insert("entityType", 1);
        keys.insert("entityId", 1);
        keys.insert("timestamp", -1);

        let index = IndexModel::builder().keys(keys).build();
        let _ = collection.create_index(index).await;

        Self {
            postgres,
            redis,
            collection,
        }
    }
}

#[async_trait]
impl IAuditLogRepo for AuditLogRepo {
    async fn list(&self, filter: AuditFilter) -> Result<(Vec<AuditLogEntry>, i64), String> {
        let mut query = Document::new();
        if let Some(module) = &filter.module {
            query.insert("module", module);
        }
        if let Some(entity_type) = &filter.entity_type {
            query.insert("entityType", entity_type);
        }
        if let Some(entity_id) = &filter.entity_id {
            query.insert("entityId", entity_id);
        }
        if let Some(search) = &filter.search {
            let pattern = Bson::RegularExpression(mongodb::bson::Regex {
                pattern: search.clone(),
                options: "i".to_string(),
            });
            query.insert(
                "$or",
                vec![
                    doc! { "module": &pattern },
                    doc! { "entityType": &pattern },
                    doc! { "entityId": &pattern },
                    doc! { "documentNumber": &pattern },
                    doc! { "actor": &pattern },
                    doc! { "summary": &pattern },
                ],
            );
        }

        let total = self
            .collection
            .count_documents(query.clone())
            .await
            .map_err(|e| e.to_string())? as i64;

        let entries = self
            .collection
            .find(query)
            .sort(doc! { "timestamp": -1 })
            .skip(filter.offset.max(0) as u64)
            .limit(filter.limit.max(0))
            .await
            .map_err(|e| e.to_string())?
            .try_collect::<Vec<AuditLogEntry>>()
            .await
            .map_err(|e| e.to_string())?;

        Ok((entries, total))
    }

    async fn get_by_id(&self, id: &str) -> Result<Option<AuditLogEntry>, String> {
        self.collection
            .find_one(doc! { "id": id })
            .await
            .map_err(|e| e.to_string())
    }

    async fn create(&self, entry: &AuditLogEntry) -> Result<(), String> {
        self.collection
            .insert_one(entry)
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    async fn delete(&self, id: &str) -> Result<bool, String> {
        let result = self
            .collection
            .delete_one(doc! { "id": id })
            .await
            .map_err(|e| e.to_string())?;

        Ok(result.deleted_count > 0)
    }

    async fn delete_for_entity(&self, entity_type: &str, entity_id: &str) -> Result<u64, String> {
        let result = self
            .collection
            .delete_many(doc! { "entityType": entity_type, "entityId": entity_id })
            .await
            .map_err(|e| e.to_string())?;

        Ok(result.deleted_count)
    }
}
