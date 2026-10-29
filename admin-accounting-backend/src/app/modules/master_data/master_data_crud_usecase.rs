use std::sync::Arc;

use async_trait::async_trait;
use serde_json::Value;

use super::master_data_crud_interface::{
    IMasterDataCrudRepo, IMasterDataCrudUsecase, MasterDataEntity,
};
use crate::pkg::response::response_error::AppError;

pub struct MasterDataCrudUsecase {
    repo: Arc<dyn IMasterDataCrudRepo>,
}

impl MasterDataCrudUsecase {
    pub fn new(repo: Arc<dyn IMasterDataCrudRepo>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl IMasterDataCrudUsecase for MasterDataCrudUsecase {
    async fn list(&self, entity: MasterDataEntity) -> Result<Vec<Value>, AppError> {
        self.repo.list(entity).await
    }

    async fn get(&self, entity: MasterDataEntity, id: i64) -> Result<Value, AppError> {
        self.repo
            .get(entity, id)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("{} not found", entity.display_name())))
    }

    async fn create(&self, entity: MasterDataEntity, payload: Value) -> Result<Value, AppError> {
        self.repo.create(entity, payload).await
    }

    async fn update(
        &self,
        entity: MasterDataEntity,
        id: i64,
        payload: Value,
    ) -> Result<Value, AppError> {
        self.repo
            .update(entity, id, payload)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("{} not found", entity.display_name())))
    }

    async fn delete(&self, entity: MasterDataEntity, id: i64) -> Result<(), AppError> {
        let deleted = self.repo.delete(entity, id).await?;
        if deleted {
            Ok(())
        } else {
            Err(AppError::NotFound(format!(
                "{} not found",
                entity.display_name()
            )))
        }
    }
}
