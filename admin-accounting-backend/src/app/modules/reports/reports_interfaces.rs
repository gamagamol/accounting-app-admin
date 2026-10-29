use async_trait::async_trait;
use chrono::NaiveDate;
use serde_json::Value;

use super::reports_dto::{CreateReportLockDto, ReportKind};
use crate::pkg::response::response_error::AppError;

#[async_trait]
pub trait IReportRepo: Send + Sync {
    async fn get(&self, kind: ReportKind, period: Option<&str>) -> Result<Value, String>;
    async fn get_lock(&self, report_code: &str, period: &str) -> Result<Option<Value>, String>;
    async fn upsert_lock(
        &self,
        report_code: &str,
        period: &str,
        as_of_date: NaiveDate,
        payload: Value,
        locked_by: Option<i64>,
        notes: Option<String>,
    ) -> Result<Value, String>;
    async fn delete_lock(&self, report_code: &str, period: &str) -> Result<bool, String>;
}

#[async_trait]
pub trait IReportUsecase: Send + Sync {
    async fn get(&self, slug: &str, period: Option<&str>) -> Result<Value, AppError>;
    async fn get_lock(&self, slug: &str, period: &str) -> Result<Option<Value>, AppError>;
    async fn lock(&self, slug: &str, dto: CreateReportLockDto) -> Result<Value, AppError>;
    async fn unlock(&self, slug: &str, period: &str) -> Result<(), AppError>;
    fn available(&self) -> &'static [&'static str];
}
