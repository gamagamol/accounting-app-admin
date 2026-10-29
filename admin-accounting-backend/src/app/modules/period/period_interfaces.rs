use async_trait::async_trait;
use serde_json::Value;

use super::period_dto::{CreatePeriodDto, ListPeriodsQuery, PeriodActionDto, UpdatePeriodDto};
use crate::pkg::response::response_error::AppError;

#[async_trait]
pub trait IPeriodRepo: Send + Sync {
    async fn list(&self, query: &ListPeriodsQuery) -> Result<Vec<Value>, AppError>;
    async fn get(&self, id: i64) -> Result<Option<Value>, AppError>;
    async fn create(&self, dto: &CreatePeriodDto) -> Result<Value, AppError>;
    async fn update(&self, id: i64, dto: &UpdatePeriodDto) -> Result<Value, AppError>;
    async fn delete(&self, id: i64) -> Result<bool, AppError>;
    async fn close(&self, id: i64, dto: &PeriodActionDto) -> Result<Value, AppError>;
    async fn reopen(&self, id: i64, dto: &PeriodActionDto) -> Result<Value, AppError>;
}

#[async_trait]
pub trait IPeriodUsecase: Send + Sync {
    async fn list(&self, query: ListPeriodsQuery) -> Result<Vec<Value>, AppError>;
    async fn get(&self, id: i64) -> Result<Value, AppError>;
    async fn create(&self, dto: CreatePeriodDto) -> Result<Value, AppError>;
    async fn update(&self, id: i64, dto: UpdatePeriodDto) -> Result<Value, AppError>;
    async fn delete(&self, id: i64) -> Result<(), AppError>;
    async fn close(&self, id: i64, dto: PeriodActionDto) -> Result<Value, AppError>;
    async fn reopen(&self, id: i64, dto: PeriodActionDto) -> Result<Value, AppError>;
}
