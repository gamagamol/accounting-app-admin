use async_trait::async_trait;
use futures_util::TryStreamExt;
use mongodb::bson::{Document, doc};
use mongodb::{Collection, Database, IndexModel};

use crate::core::audit::entities::{AuditError, AuditLogEntry};
use crate::core::audit::interfaces::{AuditFilter, AuditRepository};

/// MongoDB implementation of the append-only audit trail.
///
/// Audit entries deliberately have no PostgreSQL table. The collection is
/// configured through `MONGO_AUDIT_COLLECTION`.
pub struct MongoAuditRepository {
    collection: Collection<AuditLogEntry>,
}

impl MongoAuditRepository {
    pub async fn new(database: Database, collection_name: &str) -> Result<Self, AuditError> {
        let collection = database.collection::<AuditLogEntry>(collection_name);

        let index = IndexModel::builder()
            .keys(doc! { "entityType": 1, "entityId": 1, "timestamp": -1 })
            .build();
        collection
            .create_index(index)
            .await
            .map_err(map_mongo_error)?;

        Ok(Self { collection })
    }
}

#[async_trait]
impl AuditRepository for MongoAuditRepository {
    async fn list(&self, filter: AuditFilter) -> Result<(Vec<AuditLogEntry>, i64), AuditError> {
        let query = filter_document(&filter);

        let total = self
            .collection
            .count_documents(query.clone())
            .await
            .map_err(map_mongo_error)? as i64;

        let entries = self
            .collection
            .find(query)
            .sort(doc! { "timestamp": -1 })
            .skip(filter.offset.max(0) as u64)
            .limit(filter.limit.max(0))
            .await
            .map_err(map_mongo_error)?
            .try_collect::<Vec<AuditLogEntry>>()
            .await
            .map_err(map_mongo_error)?;

        Ok((entries, total))
    }

    async fn get_by_id(&self, id: &str) -> Result<AuditLogEntry, AuditError> {
        self.collection
            .find_one(doc! { "id": id })
            .await
            .map_err(map_mongo_error)?
            .ok_or(AuditError::NotFound)
    }

    async fn create(&self, entry: &AuditLogEntry) -> Result<(), AuditError> {
        self.collection
            .insert_one(entry)
            .await
            .map_err(map_mongo_error)?;
        Ok(())
    }

    async fn delete(&self, id: &str) -> Result<(), AuditError> {
        let result = self
            .collection
            .delete_one(doc! { "id": id })
            .await
            .map_err(map_mongo_error)?;

        if result.deleted_count == 0 {
            return Err(AuditError::NotFound);
        }

        Ok(())
    }

    async fn delete_for_entity(
        &self,
        entity_type: &str,
        entity_id: &str,
    ) -> Result<u64, AuditError> {
        let result = self
            .collection
            .delete_many(doc! {
                "entityType": entity_type,
                "entityId": entity_id,
            })
            .await
            .map_err(map_mongo_error)?;

        Ok(result.deleted_count)
    }
}

fn filter_document(filter: &AuditFilter) -> Document {
    let mut query = Document::new();

    if let Some(module) = filter.module.as_deref() {
        query.insert("module", module);
    }
    if let Some(entity_type) = filter.entity_type.as_deref() {
        query.insert("entityType", entity_type);
    }
    if let Some(entity_id) = filter.entity_id.as_deref() {
        query.insert("entityId", entity_id);
    }
    if let Some(search) = filter.search.as_deref() {
        let pattern = mongodb::bson::Regex {
            pattern: search.to_string(),
            options: "i".to_string(),
        };
        let regex = mongodb::bson::Bson::RegularExpression(pattern);
        query.insert(
            "$or",
            vec![
                doc! { "module": regex.clone() },
                doc! { "entityType": regex.clone() },
                doc! { "entityId": regex.clone() },
                doc! { "documentNumber": regex.clone() },
                doc! { "actor": regex.clone() },
                doc! { "summary": regex.clone() },
                doc! { "description": regex },
            ],
        );
    }

    query
}

fn map_mongo_error(error: mongodb::error::Error) -> AuditError {
    AuditError::Database(error.to_string())
}
