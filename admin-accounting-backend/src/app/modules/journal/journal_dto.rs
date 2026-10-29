use chrono::NaiveDate;
use serde::Deserialize;
use serde_json::Value;

#[derive(Debug, Deserialize)]
pub struct JournalListQuery {
    #[serde(default)]
    pub search: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub period: Option<String>,
    #[serde(default)]
    pub page: Option<u64>,
    #[serde(default)]
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct JournalLineDto {
    pub coa_id: i64,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub debit: f64,
    #[serde(default)]
    pub credit: f64,
    #[serde(default)]
    pub department_id: Option<i64>,
    #[serde(default)]
    pub cost_center_id: Option<i64>,
    #[serde(default)]
    pub employee_id: Option<i64>,
    #[serde(default)]
    pub tax_rate_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJournalDto {
    #[serde(default)]
    pub journal_number: Option<String>,
    pub journal_date: NaiveDate,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub reference_type: Option<String>,
    #[serde(default)]
    pub reference_id: Option<i64>,
    #[serde(default)]
    pub created_by: Option<i64>,
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default)]
    pub lines: Vec<JournalLineDto>,
}

#[derive(Debug, Deserialize)]
pub struct JournalActionDto {
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default)]
    pub actor_id: Option<i64>,
}

#[derive(Debug, serde::Serialize)]
pub struct JournalDocumentResponse {
    pub header: Value,
    pub lines: Value,
}
