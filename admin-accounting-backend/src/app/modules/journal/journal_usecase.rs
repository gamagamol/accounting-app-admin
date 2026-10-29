use std::sync::Arc;

use async_trait::async_trait;
use chrono::NaiveDate;
use serde_json::{Value, json};

use super::journal_dto::{CreateJournalDto, JournalActionDto, JournalListQuery};
use super::journal_interfaces::{IJournalRepo, IJournalUsecase};
use crate::app::modules::audit_log::{AuditLogChange, CreateAuditDto, IAuditLogUsecase};
use crate::pkg::constans::constants::{DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

pub struct JournalUsecase {
    repo: Arc<dyn IJournalRepo>,
    audit: Arc<dyn IAuditLogUsecase>,
}

impl JournalUsecase {
    pub fn new(repo: Arc<dyn IJournalRepo>, audit: Arc<dyn IAuditLogUsecase>) -> Self {
        Self { repo, audit }
    }

    fn validate(dto: &CreateJournalDto) -> Result<(f64, f64), AppError> {
        if dto.lines.len() < 2 {
            return Err(AppError::BadRequest(
                "A journal must have at least two lines".to_string(),
            ));
        }

        let mut total_debit = 0.0;
        let mut total_credit = 0.0;

        for (index, line) in dto.lines.iter().enumerate() {
            if !line.debit.is_finite() || !line.credit.is_finite() {
                return Err(AppError::BadRequest(format!(
                    "Line {} has an invalid amount",
                    index + 1
                )));
            }
            if line.debit < 0.0 || line.credit < 0.0 {
                return Err(AppError::BadRequest(format!(
                    "Line {} cannot have a negative amount",
                    index + 1
                )));
            }

            let debit = round2(line.debit);
            let credit = round2(line.credit);
            if (debit > 0.0) == (credit > 0.0) {
                return Err(AppError::BadRequest(format!(
                    "Line {} must contain exactly one of debit or credit",
                    index + 1
                )));
            }

            total_debit += debit;
            total_credit += credit;
        }

        total_debit = round2(total_debit);
        total_credit = round2(total_credit);

        if total_debit <= 0.0 {
            return Err(AppError::BadRequest(
                "Journal total must be greater than zero".to_string(),
            ));
        }
        if (total_debit - total_credit).abs() > 0.005 {
            return Err(AppError::BadRequest(format!(
                "Journal is not balanced: debit {total_debit:.2} vs credit {total_credit:.2}"
            )));
        }

        Ok((total_debit, total_credit))
    }

    async fn ensure_period_open(&self, date: NaiveDate) -> Result<(), AppError> {
        if self
            .repo
            .period_is_locked(date)
            .await
            .map_err(AppError::Database)?
        {
            return Err(AppError::Conflict(format!(
                "Period {} is locked. Unlock the report before changing journals.",
                date.format("%Y-%m")
            )));
        }
        Ok(())
    }

    fn ensure_editable(status: &str) -> Result<(), AppError> {
        if status == "draft" || status == "reopen" {
            Ok(())
        } else {
            Err(AppError::Conflict(
                "Only draft journals can be changed. Unpost the journal first.".to_string(),
            ))
        }
    }

    fn header_value<'a>(doc: &'a Value, key: &str) -> Option<&'a Value> {
        doc.get("header").and_then(|header| header.get(key))
    }

    fn doc_date(doc: &Value) -> Result<NaiveDate, AppError> {
        let raw = Self::header_value(doc, "journal_date")
            .and_then(Value::as_str)
            .ok_or_else(|| AppError::Database("Journal date is missing".to_string()))?;
        NaiveDate::parse_from_str(raw, "%Y-%m-%d")
            .map_err(|_| AppError::Database("Journal date is invalid".to_string()))
    }

    fn doc_status(doc: &Value) -> String {
        Self::header_value(doc, "status")
            .and_then(Value::as_str)
            .unwrap_or("draft")
            .to_string()
    }

    fn doc_number(doc: &Value) -> String {
        Self::header_value(doc, "journal_number")
            .and_then(Value::as_str)
            .unwrap_or("-")
            .to_string()
    }

    #[allow(clippy::too_many_arguments)]
    async fn write_audit(
        &self,
        action: &str,
        id: i64,
        doc: &Value,
        status: &str,
        actor: Option<String>,
        summary: String,
        description: String,
        changes: Vec<AuditLogChange>,
    ) {
        let result = self
            .audit
            .create(CreateAuditDto {
                module: "accounting".to_string(),
                entity_type: "journal_entry".to_string(),
                entity_id: id.to_string(),
                document_number: Self::doc_number(doc),
                action: action.to_string(),
                status: status.to_string(),
                actor: actor.unwrap_or_else(|| "system".to_string()),
                summary,
                description,
                changes,
            })
            .await;

        if let Err(error) = result {
            tracing::warn!(?error, "failed to write manual journal audit log");
        }
    }

    async fn load_document(&self, id: i64) -> Result<Value, AppError> {
        self.repo
            .get(id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound(format!("Journal {id} not found")))
    }
}

#[async_trait]
impl IJournalUsecase for JournalUsecase {
    async fn list(
        &self,
        query: JournalListQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);
        let mut query = query;
        query.page = Some(page);
        query.limit = Some(limit);

        let (rows, total) = self.repo.list(&query).await.map_err(AppError::Database)?;
        let items = serde_json::from_value::<Vec<Value>>(rows).unwrap_or_default();
        Ok((items, PaginationMeta::new(page, limit, total)))
    }

    async fn get(&self, id: i64) -> Result<Value, AppError> {
        self.load_document(id).await
    }

    async fn create(&self, dto: CreateJournalDto) -> Result<Value, AppError> {
        let (total_debit, total_credit) = Self::validate(&dto)?;
        self.ensure_period_open(dto.journal_date).await?;

        let journal_number = match dto
            .journal_number
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
        {
            Some(value) => {
                if value.chars().count() > 50 {
                    return Err(AppError::BadRequest(
                        "Journal number must be at most 50 characters".to_string(),
                    ));
                }
                value.to_string()
            }
            None => self
                .repo
                .next_number(dto.journal_date)
                .await
                .map_err(AppError::Database)?,
        };

        let actor = dto.actor.clone();
        let id = self
            .repo
            .create(&journal_number, &dto, total_debit, total_credit)
            .await
            .map_err(AppError::Database)?;
        let doc = self.load_document(id).await?;

        self.write_audit(
            "create",
            id,
            &doc,
            "draft",
            actor,
            format!("Created manual journal {journal_number}"),
            format!(
                "Manual journal {journal_number} created with debit {total_debit:.2} and credit {total_credit:.2}."
            ),
            vec![
                AuditLogChange {
                    field: "journal_number".to_string(),
                    before: None,
                    after: Some(json!(journal_number)),
                },
                AuditLogChange {
                    field: "status".to_string(),
                    before: None,
                    after: Some(json!("draft")),
                },
                AuditLogChange {
                    field: "total_debit".to_string(),
                    before: None,
                    after: Some(json!(total_debit)),
                },
                AuditLogChange {
                    field: "total_credit".to_string(),
                    before: None,
                    after: Some(json!(total_credit)),
                },
            ],
        )
        .await;

        Ok(doc)
    }

    async fn update(&self, id: i64, dto: CreateJournalDto) -> Result<Value, AppError> {
        let existing = self.load_document(id).await?;
        let status = Self::doc_status(&existing);
        Self::ensure_editable(&status)?;
        self.ensure_period_open(Self::doc_date(&existing)?).await?;
        self.ensure_period_open(dto.journal_date).await?;

        let (total_debit, total_credit) = Self::validate(&dto)?;
        let actor = dto.actor.clone();
        self.repo
            .update(id, &dto, total_debit, total_credit)
            .await
            .map_err(AppError::Database)?;
        let doc = self.load_document(id).await?;

        self.write_audit(
            "update",
            id,
            &doc,
            &status,
            actor,
            format!("Updated manual journal {}", Self::doc_number(&doc)),
            format!(
                "Manual journal {} updated. Debit {total_debit:.2}, credit {total_credit:.2}.",
                Self::doc_number(&doc)
            ),
            vec![
                AuditLogChange {
                    field: "journal_date".to_string(),
                    before: Self::header_value(&existing, "journal_date").cloned(),
                    after: Self::header_value(&doc, "journal_date").cloned(),
                },
                AuditLogChange {
                    field: "total_debit".to_string(),
                    before: Self::header_value(&existing, "total_debit").cloned(),
                    after: Some(json!(total_debit)),
                },
                AuditLogChange {
                    field: "total_credit".to_string(),
                    before: Self::header_value(&existing, "total_credit").cloned(),
                    after: Some(json!(total_credit)),
                },
            ],
        )
        .await;

        Ok(doc)
    }

    async fn delete(&self, id: i64, actor: Option<String>) -> Result<(), AppError> {
        let existing = self.load_document(id).await?;
        let status = Self::doc_status(&existing);
        Self::ensure_editable(&status)?;
        self.ensure_period_open(Self::doc_date(&existing)?).await?;

        let deleted = self.repo.delete(id).await.map_err(AppError::Database)?;
        if !deleted {
            return Err(AppError::NotFound(format!("Journal {id} not found")));
        }

        self.write_audit(
            "delete",
            id,
            &existing,
            "completed",
            actor,
            format!("Deleted manual journal {}", Self::doc_number(&existing)),
            format!(
                "Manual journal {} was deleted before posting.",
                Self::doc_number(&existing)
            ),
            vec![AuditLogChange {
                field: "status".to_string(),
                before: Some(json!(status)),
                after: Some(json!("deleted")),
            }],
        )
        .await;

        Ok(())
    }

    async fn post(&self, id: i64, dto: JournalActionDto) -> Result<Value, AppError> {
        let existing = self.load_document(id).await?;
        let status = Self::doc_status(&existing);
        Self::ensure_editable(&status)?;
        self.ensure_period_open(Self::doc_date(&existing)?).await?;

        self.repo
            .post(id, dto.actor_id)
            .await
            .map_err(AppError::Database)?;
        let doc = self.load_document(id).await?;

        self.write_audit(
            "post",
            id,
            &doc,
            "completed",
            dto.actor,
            format!("Posted manual journal {}", Self::doc_number(&doc)),
            format!(
                "Manual journal {} posted and is now included in financial reports.",
                Self::doc_number(&doc)
            ),
            vec![AuditLogChange {
                field: "status".to_string(),
                before: Some(json!(status)),
                after: Some(json!("completed")),
            }],
        )
        .await;

        Ok(doc)
    }

    async fn unpost(&self, id: i64, dto: JournalActionDto) -> Result<Value, AppError> {
        let existing = self.load_document(id).await?;
        let status = Self::doc_status(&existing);
        if status != "completed" {
            return Err(AppError::Conflict(
                "Only posted journals can be unposted".to_string(),
            ));
        }
        self.ensure_period_open(Self::doc_date(&existing)?).await?;

        self.repo.unpost(id).await.map_err(AppError::Database)?;
        let doc = self.load_document(id).await?;

        self.write_audit(
            "reopen",
            id,
            &doc,
            "draft",
            dto.actor,
            format!("Unposted manual journal {}", Self::doc_number(&doc)),
            format!(
                "Manual journal {} returned to draft and removed from financial reports.",
                Self::doc_number(&doc)
            ),
            vec![AuditLogChange {
                field: "status".to_string(),
                before: Some(json!("completed")),
                after: Some(json!("draft")),
            }],
        )
        .await;

        Ok(doc)
    }
}

fn round2(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}
