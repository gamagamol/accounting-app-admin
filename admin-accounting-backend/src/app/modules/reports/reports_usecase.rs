use std::sync::Arc;

use async_trait::async_trait;
use chrono::{Datelike, NaiveDate};
use serde_json::Value;

use super::reports_dto::{CreateReportLockDto, ReportKind};
use super::reports_interfaces::{IReportRepo, IReportUsecase};
use crate::pkg::response::response_error::AppError;

pub struct ReportUsecase {
    repo: Arc<dyn IReportRepo>,
}

impl ReportUsecase {
    pub fn new(repo: Arc<dyn IReportRepo>) -> Self {
        Self { repo }
    }

    fn kind(slug: &str) -> Result<ReportKind, AppError> {
        ReportKind::from_slug(slug)
            .ok_or_else(|| AppError::NotFound(format!("Unknown report '{slug}'")))
    }

    fn period_end(period: &str) -> Result<NaiveDate, AppError> {
        let period = period.trim();

        // Fiscal-year mode: YYYY covers January through December.
        if period.len() == 4 {
            let year = period.parse::<i32>().map_err(|_| {
                AppError::BadRequest("Period must use YYYY or YYYY-MM format".to_string())
            })?;
            let next = NaiveDate::from_ymd_opt(year + 1, 1, 1)
                .ok_or_else(|| AppError::BadRequest("Invalid period".to_string()))?;
            return next
                .pred_opt()
                .ok_or_else(|| AppError::BadRequest("Invalid period".to_string()));
        }

        let start =
            NaiveDate::parse_from_str(&format!("{period}-01"), "%Y-%m-%d").map_err(|_| {
                AppError::BadRequest("Period must use YYYY or YYYY-MM format".to_string())
            })?;
        let (next_year, next_month) = if start.month() == 12 {
            (start.year() + 1, 1)
        } else {
            (start.year(), start.month() + 1)
        };
        let next = NaiveDate::from_ymd_opt(next_year, next_month, 1)
            .ok_or_else(|| AppError::BadRequest("Invalid period".to_string()))?;
        next.pred_opt()
            .ok_or_else(|| AppError::BadRequest("Invalid period".to_string()))
    }

    fn validate_period(period: &str) -> Result<(), AppError> {
        Self::period_end(period).map(|_| ())
    }
}

#[async_trait]
impl IReportUsecase for ReportUsecase {
    async fn get(&self, slug: &str, period: Option<&str>) -> Result<Value, AppError> {
        let kind = Self::kind(slug)?;

        if let Some(period) = period
            && kind.is_financial()
        {
            Self::validate_period(period)?;
            if let Some(lock) = self
                .repo
                .get_lock(slug, period)
                .await
                .map_err(AppError::Database)?
            {
                return Ok(lock
                    .get("payload")
                    .cloned()
                    .unwrap_or_else(|| Value::Array(Vec::new())));
            }
        }

        self.repo
            .get(kind, period)
            .await
            .map_err(AppError::Database)
    }

    async fn get_lock(&self, slug: &str, period: &str) -> Result<Option<Value>, AppError> {
        let kind = Self::kind(slug)?;
        if !kind.is_financial() {
            return Ok(None);
        }
        Self::validate_period(period)?;
        self.repo
            .get_lock(slug, period)
            .await
            .map_err(AppError::Database)
    }

    async fn lock(&self, slug: &str, dto: CreateReportLockDto) -> Result<Value, AppError> {
        let kind = Self::kind(slug)?;
        if !kind.is_financial() {
            return Err(AppError::BadRequest(
                "Only financial reports can be locked".to_string(),
            ));
        }
        Self::validate_period(&dto.period)?;

        let as_of_date = match dto.as_of_date {
            Some(date) => date,
            None => Self::period_end(&dto.period)?,
        };

        let payload = self
            .repo
            .get(kind, Some(&dto.period))
            .await
            .map_err(AppError::Database)?;

        self.repo
            .upsert_lock(
                slug,
                &dto.period,
                as_of_date,
                payload,
                dto.locked_by,
                dto.notes,
            )
            .await
            .map_err(AppError::Database)
    }

    async fn unlock(&self, slug: &str, period: &str) -> Result<(), AppError> {
        let kind = Self::kind(slug)?;
        if !kind.is_financial() {
            return Err(AppError::BadRequest(
                "Only financial reports can be unlocked".to_string(),
            ));
        }
        Self::validate_period(period)?;
        self.repo
            .delete_lock(slug, period)
            .await
            .map_err(AppError::Database)?;
        Ok(())
    }

    fn available(&self) -> &'static [&'static str] {
        ReportKind::all()
    }
}
