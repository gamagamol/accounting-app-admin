use std::collections::HashMap;
use std::sync::RwLock;

use async_trait::async_trait;

use crate::core::audit::entities::{AuditError, AuditLogEntry};
use crate::core::audit::interfaces::{AuditFilter, AuditRepository};

/// In-memory audit repository used by unit tests and local development when
/// MongoDB is disabled. Data resets when the process restarts.
pub struct MemoryAuditRepository {
    entries: RwLock<HashMap<String, AuditLogEntry>>,
}

impl MemoryAuditRepository {
    pub fn new() -> Self {
        Self {
            entries: RwLock::new(HashMap::new()),
        }
    }

    fn read_entries(&self) -> std::sync::RwLockReadGuard<'_, HashMap<String, AuditLogEntry>> {
        self.entries
            .read()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }

    fn write_entries(&self) -> std::sync::RwLockWriteGuard<'_, HashMap<String, AuditLogEntry>> {
        self.entries
            .write()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }
}

impl Default for MemoryAuditRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AuditRepository for MemoryAuditRepository {
    async fn list(&self, filter: AuditFilter) -> Result<(Vec<AuditLogEntry>, i64), AuditError> {
        let entries = self.read_entries();
        let search = filter.search.as_deref().map(str::to_lowercase);

        let mut items: Vec<AuditLogEntry> = entries
            .values()
            .filter(|entry| {
                if let Some(module) = filter.module.as_deref()
                    && entry.module != module
                {
                    return false;
                }

                if let Some(entity_type) = filter.entity_type.as_deref()
                    && entry.entity_type != entity_type
                {
                    return false;
                }

                if let Some(entity_id) = filter.entity_id.as_deref()
                    && entry.entity_id != entity_id
                {
                    return false;
                }

                if let Some(search) = search.as_deref() {
                    let haystack = format!(
                        "{} {} {} {} {} {}",
                        entry.module,
                        entry.entity_type,
                        entry.entity_id,
                        entry.document_number,
                        entry.actor,
                        entry.summary
                    )
                    .to_lowercase();
                    if !haystack.contains(search) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect();

        items.sort_by(|left, right| right.timestamp.cmp(&left.timestamp));

        let total = items.len() as i64;
        let start = filter.offset.max(0) as usize;
        let limit = filter.limit.max(0) as usize;
        let end = start.saturating_add(limit).min(items.len());

        let items = if start < items.len() {
            items[start..end].to_vec()
        } else {
            Vec::new()
        };

        Ok((items, total))
    }

    async fn get_by_id(&self, id: &str) -> Result<AuditLogEntry, AuditError> {
        self.read_entries()
            .get(id)
            .cloned()
            .ok_or(AuditError::NotFound)
    }

    async fn create(&self, entry: &AuditLogEntry) -> Result<(), AuditError> {
        self.write_entries().insert(entry.id.clone(), entry.clone());
        Ok(())
    }

    async fn delete(&self, id: &str) -> Result<(), AuditError> {
        if self.write_entries().remove(id).is_none() {
            return Err(AuditError::NotFound);
        }
        Ok(())
    }

    async fn delete_for_entity(
        &self,
        entity_type: &str,
        entity_id: &str,
    ) -> Result<u64, AuditError> {
        let mut entries = self.write_entries();
        let before = entries.len();
        entries
            .retain(|_, entry| !(entry.entity_type == entity_type && entry.entity_id == entity_id));
        Ok((before - entries.len()) as u64)
    }
}
