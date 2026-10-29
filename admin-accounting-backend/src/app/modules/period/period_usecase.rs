use std::sync::Arc;

use async_trait::async_trait;
use serde_json::Value;

use super::period_dto::{CreatePeriodDto, ListPeriodsQuery, PeriodActionDto, UpdatePeriodDto};
use super::period_interfaces::{IPeriodRepo, IPeriodUsecase};
use crate::pkg::response::response_error::AppError;

pub struct PeriodUsecase {
    repo: Arc<dyn IPeriodRepo>,
}

impl PeriodUsecase {
    pub fn new(repo: Arc<dyn IPeriodRepo>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl IPeriodUsecase for PeriodUsecase {
    async fn list(&self, query: ListPeriodsQuery) -> Result<Vec<Value>, AppError> {
        self.repo.list(&query).await
    }

    async fn get(&self, id: i64) -> Result<Value, AppError> {
        self.repo
            .get(id)
            .await?
            .ok_or_else(|| AppError::NotFound("accounting period not found".into()))
    }

    async fn create(&self, dto: CreatePeriodDto) -> Result<Value, AppError> {
        self.repo.create(&dto).await
    }

    async fn update(&self, id: i64, dto: UpdatePeriodDto) -> Result<Value, AppError> {
        self.repo.update(id, &dto).await
    }

    async fn delete(&self, id: i64) -> Result<(), AppError> {
        let deleted = self.repo.delete(id).await?;
        if deleted {
            Ok(())
        } else {
            Err(AppError::NotFound("accounting period not found".into()))
        }
    }

    async fn close(&self, id: i64, dto: PeriodActionDto) -> Result<Value, AppError> {
        self.repo.close(id, &dto).await
    }

    async fn reopen(&self, id: i64, dto: PeriodActionDto) -> Result<Value, AppError> {
        self.repo.reopen(id, &dto).await
    }
}
