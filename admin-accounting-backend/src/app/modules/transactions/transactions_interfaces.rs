use async_trait::async_trait;
use serde_json::Value;

use super::transactions_dto::{
    AccountMapping, ApproveTransactionDto, CreateTransactionDto, DocumentType, HeaderSnapshot,
    LineSnapshot, ListTransactionsQuery, PreparedHeader, PreparedLine, ProductInfo,
    TransactionResponse,
};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

#[async_trait]
pub trait ITransactionRepo: Send + Sync {
    async fn list(
        &self,
        doc_type: DocumentType,
        query: &ListTransactionsQuery,
    ) -> Result<(Vec<Value>, u64), String>;
    async fn get(
        &self,
        doc_type: DocumentType,
        id: i64,
    ) -> Result<Option<TransactionResponse>, String>;
    async fn get_header(
        &self,
        doc_type: DocumentType,
        id: i64,
    ) -> Result<Option<HeaderSnapshot>, String>;
    async fn get_lines(&self, doc_type: DocumentType, id: i64)
    -> Result<Vec<LineSnapshot>, String>;
    async fn product_info(&self, product_id: i64) -> Result<ProductInfo, String>;
    async fn tax_rate(&self, tax_rate_id: i64) -> Result<f64, String>;
    async fn account_mapping(&self, product_id: i64) -> Result<AccountMapping, String>;
    async fn coa_id(&self, code: &str) -> Result<i64, String>;
    async fn bank_coa_id(&self, bank_account_id: Option<i64>) -> Result<i64, String>;
    async fn stock_available(&self, product_id: i64, warehouse_id: i64) -> Result<f64, String>;
    /// Total quantity already invoiced for a delivery/goods-receipt detail line.
    async fn invoiced_quantity(
        &self,
        doc_type: DocumentType,
        detail_id: i64,
    ) -> Result<f64, String>;
    async fn next_number(
        &self,
        doc_type: DocumentType,
        date: chrono::NaiveDate,
    ) -> Result<String, String>;

    async fn create_quotation(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn create_sales_order(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn create_delivery(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn create_sales_invoice(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn create_customer_receipt(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn create_purchase_order(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn create_goods_receipt(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn create_purchase_invoice(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn create_vendor_payment(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String>;
    async fn approve(
        &self,
        doc_type: DocumentType,
        id: i64,
        actor_id: Option<i64>,
    ) -> Result<(), String>;
}

#[async_trait]
pub trait ITransactionUsecase: Send + Sync {
    async fn list(
        &self,
        doc_type: DocumentType,
        query: ListTransactionsQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError>;
    async fn get(&self, doc_type: DocumentType, id: i64) -> Result<TransactionResponse, AppError>;
    async fn create(
        &self,
        doc_type: DocumentType,
        dto: CreateTransactionDto,
    ) -> Result<TransactionResponse, AppError>;
    async fn approve(
        &self,
        doc_type: DocumentType,
        id: i64,
        dto: ApproveTransactionDto,
    ) -> Result<TransactionResponse, AppError>;
}
