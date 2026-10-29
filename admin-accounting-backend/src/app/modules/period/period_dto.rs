use chrono::NaiveDate;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct ListPeriodsQuery {
    #[serde(default)]
    pub search: Option<String>,
    #[serde(default, alias = "fiscalYear")]
    pub fiscal_year: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePeriodDto {
    #[serde(default, alias = "period")]
    pub period_code: Option<String>,
    #[serde(alias = "startDate")]
    pub start_date: NaiveDate,
    #[serde(alias = "endDate")]
    pub end_date: NaiveDate,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default, alias = "closedBy")]
    pub closed_by: Option<i64>,
    #[serde(default)]
    pub actor: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePeriodDto {
    #[serde(default, alias = "period")]
    pub period_code: Option<String>,
    #[serde(default, alias = "startDate")]
    pub start_date: Option<NaiveDate>,
    #[serde(default, alias = "endDate")]
    pub end_date: Option<NaiveDate>,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default, alias = "closedBy")]
    pub closed_by: Option<i64>,
    #[serde(default)]
    pub actor: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PeriodActionDto {
    #[serde(default, alias = "closedBy")]
    pub closed_by: Option<i64>,
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default)]
    pub notes: Option<String>,
}
