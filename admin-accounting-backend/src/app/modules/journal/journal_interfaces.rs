use async_trait::async_trait;
use serde_json::Value;

use super::journal_dto::{CreateJournalDto, JournalActionDto, JournalListQuery};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

#[async_trait]
pub trait IJournalRepo: Send + Sync {
    async fn list(&self, query: &JournalListQuery) -> Result<(Value, u64), String>;
    async fn get(&self, id: i64) -> Result<Option<Value>, String>;
    async fn status(&self, id: i64) -> Result<Option<String>, String>;
    async fn next_number(&self, date: chrono::NaiveDate) -> Result<String, String>;
    async fn create(
        &self,
        journal_number: &str,
        dto: &CreateJournalDto,
        total_debit: f64,
        total_credit: f64,
    ) -> Result<i64, String>;
    async fn update(
        &self,
        id: i64,
        dto: &CreateJournalDto,
        total_debit: f64,
        total_credit: f64,
    ) -> Result<(), String>;
    async fn delete(&self, id: i64) -> Result<bool, String>;
    async fn post(&self, id: i64, actor_id: Option<i64>) -> Result<(), String>;
    async fn unpost(&self, id: i64) -> Result<(), String>;
    async fn period_is_locked(&self, date: chrono::NaiveDate) -> Result<bool, String>;
}

#[async_trait]
pub trait IJournalUsecase: Send + Sync {
    async fn list(&self, query: JournalListQuery)
    -> Result<(Vec<Value>, PaginationMeta), AppError>;
    async fn get(&self, id: i64) -> Result<Value, AppError>;
    async fn create(&self, dto: CreateJournalDto) -> Result<Value, AppError>;
    async fn update(&self, id: i64, dto: CreateJournalDto) -> Result<Value, AppError>;
    async fn delete(&self, id: i64, actor: Option<String>) -> Result<(), AppError>;
    async fn post(&self, id: i64, dto: JournalActionDto) -> Result<Value, AppError>;
    async fn unpost(&self, id: i64, dto: JournalActionDto) -> Result<Value, AppError>;
}
