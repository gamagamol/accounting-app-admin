use std::collections::BTreeMap;

use chrono::{NaiveDate, Utc};
use serde::Deserialize;
use serde_json::Value;
use sqlx::{FromRow, PgPool, Postgres, Transaction};

use super::transactions_dto::{
    AccountMapping, DocumentType, HeaderSnapshot, LineSnapshot, ListTransactionsQuery,
    PreparedHeader, PreparedLine, ProductInfo, TransactionResponse,
};
use super::transactions_interfaces::ITransactionRepo;

macro_rules! sql {
    ($($arg:tt)*) => {
        sqlx::AssertSqlSafe(format!($($arg)*))
    };
}

pub struct TransactionRepo {
    pool: PgPool,
}

impl TransactionRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Header JSON with parent document numbers and workflow flags attached.
    ///
    /// The workflow flags are used by the frontend to hide transactions that are
    /// already fully processed from downstream document options.
    fn header_select_sql(doc_type: DocumentType) -> String {
        match doc_type {
            DocumentType::Quotation => format!(
                "SELECT to_jsonb(t) || jsonb_build_object(\
                    'is_converted', EXISTS (\
                        SELECT 1 FROM {} so WHERE so.quotation_id = t.id\
                    )\
                 ) FROM {} t",
                DocumentType::SalesOrder.header_table(),
                doc_type.header_table()
            ),
            DocumentType::SalesOrder => format!(
                "SELECT to_jsonb(t) || jsonb_build_object(\
                    'quotation_number', q.document_number, \
                    'has_remaining_delivery', EXISTS (\
                        SELECT 1 FROM {} sod \
                        WHERE sod.sales_order_id = t.id AND sod.quantity > sod.quantity_delivered\
                    )\
                 ) FROM {} t LEFT JOIN {} q ON q.id = t.quotation_id",
                DocumentType::SalesOrder.detail_table(),
                doc_type.header_table(),
                DocumentType::Quotation.header_table()
            ),
            DocumentType::Delivery => format!(
                "SELECT to_jsonb(t) || jsonb_build_object(\
                    'sales_order_number', so.document_number, \
                    'has_remaining_invoice', EXISTS (\
                        SELECT 1 FROM {} dd \
                        WHERE dd.delivery_id = t.id AND dd.quantity > COALESCE((\
                            SELECT SUM(sid.quantity) FROM {} sid \
                            WHERE sid.delivery_detail_id = dd.id\
                        ), 0)\
                    )\
                 ) FROM {} t LEFT JOIN {} so ON so.id = t.sales_order_id",
                DocumentType::Delivery.detail_table(),
                DocumentType::SalesInvoice.detail_table(),
                doc_type.header_table(),
                DocumentType::SalesOrder.header_table()
            ),
            DocumentType::SalesInvoice => format!(
                "SELECT to_jsonb(t) || jsonb_build_object(\
                    'sales_order_number', so.document_number, \
                    'delivery_number', d.document_number\
                 ) FROM {} t \
                 LEFT JOIN {} so ON so.id = t.sales_order_id \
                 LEFT JOIN {} d ON d.id = t.delivery_id",
                doc_type.header_table(),
                DocumentType::SalesOrder.header_table(),
                DocumentType::Delivery.header_table()
            ),
            DocumentType::PurchaseOrder => format!(
                "SELECT to_jsonb(t) || jsonb_build_object(\
                    'has_remaining_receipt', EXISTS (\
                        SELECT 1 FROM {} pod \
                        WHERE pod.purchase_order_id = t.id AND pod.quantity > pod.quantity_received\
                    )\
                 ) FROM {} t",
                DocumentType::PurchaseOrder.detail_table(),
                doc_type.header_table()
            ),
            DocumentType::GoodsReceipt => format!(
                "SELECT to_jsonb(t) || jsonb_build_object(\
                    'purchase_order_number', po.document_number, \
                    'has_remaining_invoice', EXISTS (\
                        SELECT 1 FROM {} grd \
                        WHERE grd.goods_receipt_id = t.id AND grd.quantity > COALESCE((\
                            SELECT SUM(pid.quantity) FROM {} pid \
                            WHERE pid.goods_receipt_detail_id = grd.id\
                        ), 0)\
                    )\
                 ) FROM {} t LEFT JOIN {} po ON po.id = t.purchase_order_id",
                DocumentType::GoodsReceipt.detail_table(),
                DocumentType::PurchaseInvoice.detail_table(),
                doc_type.header_table(),
                DocumentType::PurchaseOrder.header_table()
            ),
            DocumentType::PurchaseInvoice => format!(
                "SELECT to_jsonb(t) || jsonb_build_object(\
                    'purchase_order_number', po.document_number, \
                    'goods_receipt_number', gr.document_number\
                 ) FROM {} t \
                 LEFT JOIN {} po ON po.id = t.purchase_order_id \
                 LEFT JOIN {} gr ON gr.id = t.goods_receipt_id",
                doc_type.header_table(),
                DocumentType::PurchaseOrder.header_table(),
                DocumentType::GoodsReceipt.header_table()
            ),
            _ => format!("SELECT to_jsonb(t) FROM {} t", doc_type.header_table()),
        }
    }
}

#[derive(Debug, Deserialize)]
struct HeaderJson {
    id: i64,
    document_number: String,
    document_date: NaiveDate,
    #[serde(default)]
    customer_id: Option<i64>,
    #[serde(default)]
    supplier_id: Option<i64>,
    #[serde(default)]
    warehouse_id: Option<i64>,
    status: String,
    #[serde(default)]
    payment_term_id: Option<i64>,
    #[serde(default)]
    tax_rate_id: Option<i64>,
    #[serde(default)]
    salesperson_id: Option<i64>,
    #[serde(default)]
    grand_total: Option<f64>,
    #[serde(default)]
    paid_amount: Option<f64>,
    #[serde(default)]
    outstanding_amount: Option<f64>,
    #[serde(default)]
    quotation_id: Option<i64>,
    #[serde(default)]
    sales_order_id: Option<i64>,
    #[serde(default)]
    delivery_id: Option<i64>,
    #[serde(default)]
    purchase_order_id: Option<i64>,
    #[serde(default)]
    goods_receipt_id: Option<i64>,
}

impl HeaderJson {
    fn into_snapshot(self) -> HeaderSnapshot {
        HeaderSnapshot {
            id: self.id,
            document_number: self.document_number,
            document_date: self.document_date,
            customer_id: self.customer_id,
            supplier_id: self.supplier_id,
            warehouse_id: self.warehouse_id,
            status: self.status,
            payment_term_id: self.payment_term_id,
            tax_rate_id: self.tax_rate_id,
            salesperson_id: self.salesperson_id,
            grand_total: self.grand_total.unwrap_or(0.0),
            paid_amount: self.paid_amount.unwrap_or(0.0),
            outstanding_amount: self.outstanding_amount.unwrap_or(0.0),
            quotation_id: self.quotation_id,
            sales_order_id: self.sales_order_id,
            delivery_id: self.delivery_id,
            purchase_order_id: self.purchase_order_id,
            goods_receipt_id: self.goods_receipt_id,
        }
    }
}

#[derive(Debug, Deserialize)]
struct LineJson {
    id: i64,
    line_number: i32,
    #[serde(default)]
    product_id: Option<i64>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    quantity: Option<f64>,
    #[serde(default)]
    uom_id: Option<i64>,
    #[serde(default)]
    unit_price: Option<f64>,
    #[serde(default)]
    unit_cost: Option<f64>,
    #[serde(default)]
    discount_percent: Option<f64>,
    #[serde(default)]
    discount_amount: Option<f64>,
    #[serde(default)]
    tax_rate_id: Option<i64>,
    #[serde(default)]
    tax_amount: Option<f64>,
    #[serde(default)]
    subtotal: Option<f64>,
    #[serde(default)]
    total: Option<f64>,
    #[serde(default)]
    quantity_delivered: Option<f64>,
    #[serde(default)]
    quantity_invoiced: Option<f64>,
    #[serde(default)]
    quantity_received: Option<f64>,
    #[serde(default)]
    sales_order_detail_id: Option<i64>,
    #[serde(default)]
    purchase_order_detail_id: Option<i64>,
    #[serde(default)]
    delivery_detail_id: Option<i64>,
    #[serde(default)]
    goods_receipt_detail_id: Option<i64>,
    #[serde(default)]
    sales_invoice_id: Option<i64>,
    #[serde(default)]
    purchase_invoice_id: Option<i64>,
    #[serde(default)]
    amount: Option<f64>,
}

impl LineJson {
    fn into_snapshot(self) -> LineSnapshot {
        let parent_detail_id = self
            .sales_order_detail_id
            .or(self.purchase_order_detail_id)
            .or(self.delivery_detail_id)
            .or(self.goods_receipt_detail_id);

        LineSnapshot {
            id: self.id,
            line_number: self.line_number,
            product_id: self.product_id,
            description: self.description,
            quantity: self.quantity.unwrap_or(0.0),
            uom_id: self.uom_id,
            unit_price: self.unit_price.unwrap_or(0.0),
            unit_cost: self.unit_cost.unwrap_or(0.0),
            discount_percent: self.discount_percent.unwrap_or(0.0),
            discount_amount: self.discount_amount.unwrap_or(0.0),
            tax_rate_id: self.tax_rate_id,
            tax_amount: self.tax_amount.unwrap_or(0.0),
            subtotal: self.subtotal.unwrap_or(0.0),
            total: self.total.unwrap_or(0.0),
            quantity_delivered: self.quantity_delivered.unwrap_or(0.0),
            quantity_invoiced: self.quantity_invoiced.unwrap_or(0.0),
            quantity_received: self.quantity_received.unwrap_or(0.0),
            parent_detail_id,
            sales_invoice_id: self.sales_invoice_id,
            purchase_invoice_id: self.purchase_invoice_id,
            amount: self.amount.unwrap_or(0.0),
        }
    }
}

#[derive(Debug, FromRow)]
struct ProductRow {
    id: i64,
    product_code: String,
    name: String,
    base_uom_id: i64,
    selling_price: f64,
    cost_price: f64,
    category_id: Option<i64>,
}

#[derive(Debug, FromRow)]
struct MappingRow {
    inventory_account_id: i64,
    sales_account_id: i64,
    cogs_account_id: i64,
}

#[derive(Debug, Clone)]
struct JournalLine {
    coa_id: i64,
    description: String,
    debit: f64,
    credit: f64,
}

#[async_trait::async_trait]
impl ITransactionRepo for TransactionRepo {
    async fn list(
        &self,
        doc_type: DocumentType,
        query: &ListTransactionsQuery,
    ) -> Result<(Vec<Value>, u64), String> {
        let table = doc_type.header_table();
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(20).clamp(1, 100);
        let offset = (page - 1) * limit;
        let search = query.search.as_deref();

        let total: i64 = sqlx::query_scalar(sql!(
            "SELECT COUNT(*) FROM {table} t
             WHERE ($1::text IS NULL OR t.document_number ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR t.status = $2)"
        ))
        .bind(search)
        .bind(query.status.as_deref())
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        let select = Self::header_select_sql(doc_type);
        let rows: Vec<Value> = sqlx::query_scalar(sql!(
            "{select}
             WHERE ($1::text IS NULL OR t.document_number ILIKE '%' || $1 || '%')
               AND ($2::text IS NULL OR t.status = $2)
             ORDER BY t.id DESC
             LIMIT $3 OFFSET $4"
        ))
        .bind(search)
        .bind(query.status.as_deref())
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok((rows, total as u64))
    }

    async fn get(
        &self,
        doc_type: DocumentType,
        id: i64,
    ) -> Result<Option<TransactionResponse>, String> {
        let select = Self::header_select_sql(doc_type);
        let header: Option<Value> = sqlx::query_scalar(sql!("{select} WHERE t.id = $1"))
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        let Some(header) = header else {
            return Ok(None);
        };

        let lines: Vec<Value> = sqlx::query_scalar(sql!(
            "SELECT to_jsonb(t) FROM {} t WHERE t.{} = $1 ORDER BY t.line_number",
            doc_type.detail_table(),
            doc_type.detail_fk()
        ))
        .bind(id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(Some(TransactionResponse {
            document_type: doc_type.as_str().to_string(),
            header,
            lines,
        }))
    }

    async fn get_header(
        &self,
        doc_type: DocumentType,
        id: i64,
    ) -> Result<Option<HeaderSnapshot>, String> {
        let row: Option<Value> = sqlx::query_scalar(sql!(
            "SELECT to_jsonb(t) FROM {} t WHERE t.id = $1",
            doc_type.header_table()
        ))
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        row.map(|value| {
            serde_json::from_value::<HeaderJson>(value)
                .map(HeaderJson::into_snapshot)
                .map_err(|e| e.to_string())
        })
        .transpose()
    }

    async fn get_lines(
        &self,
        doc_type: DocumentType,
        id: i64,
    ) -> Result<Vec<LineSnapshot>, String> {
        let rows: Vec<Value> = sqlx::query_scalar(sql!(
            "SELECT to_jsonb(t) FROM {} t WHERE t.{} = $1 ORDER BY t.line_number",
            doc_type.detail_table(),
            doc_type.detail_fk()
        ))
        .bind(id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        rows.into_iter()
            .map(|value| {
                serde_json::from_value::<LineJson>(value)
                    .map(LineJson::into_snapshot)
                    .map_err(|e| e.to_string())
            })
            .collect()
    }

    async fn product_info(&self, product_id: i64) -> Result<ProductInfo, String> {
        let row = sqlx::query_as::<_, ProductRow>(
            "SELECT id, product_code, name, base_uom_id,
                    selling_price::float8 AS selling_price,
                    cost_price::float8 AS cost_price,
                    category_id
             FROM masterdata_product WHERE id = $1",
        )
        .bind(product_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("product {product_id} not found"))?;

        Ok(ProductInfo {
            id: row.id,
            product_code: row.product_code,
            name: row.name,
            base_uom_id: row.base_uom_id,
            selling_price: row.selling_price,
            cost_price: row.cost_price,
            category_id: row.category_id,
        })
    }

    async fn tax_rate(&self, tax_rate_id: i64) -> Result<f64, String> {
        sqlx::query_scalar::<_, f64>(
            "SELECT rate::float8 FROM masterdata_tax_rate WHERE id = $1 AND is_active = true",
        )
        .bind(tax_rate_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("tax rate {tax_rate_id} not found"))
    }

    async fn account_mapping(&self, product_id: i64) -> Result<AccountMapping, String> {
        let row = sqlx::query_as::<_, MappingRow>(
            "SELECT m.inventory_account_id, m.sales_account_id, m.cogs_account_id
             FROM masterdata_product p
             JOIN masterdata_product_account_mapping m ON m.product_category_id = p.category_id
             WHERE p.id = $1",
        )
        .bind(product_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        if let Some(row) = row {
            return Ok(AccountMapping {
                inventory_account_id: row.inventory_account_id,
                sales_account_id: row.sales_account_id,
                cogs_account_id: row.cogs_account_id,
            });
        }

        Ok(AccountMapping {
            inventory_account_id: self.coa_id("113").await?,
            sales_account_id: self.coa_id("411").await?,
            cogs_account_id: self.coa_id("500").await?,
        })
    }

    async fn coa_id(&self, code: &str) -> Result<i64, String> {
        sqlx::query_scalar::<_, i64>("SELECT id FROM masterdata_coa WHERE account_code = $1")
            .bind(code)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| format!("COA {code} not found"))
    }

    async fn bank_coa_id(&self, bank_account_id: Option<i64>) -> Result<i64, String> {
        if let Some(id) = bank_account_id
            && let Some(coa_id) = sqlx::query_scalar::<_, i64>(
                "SELECT coa_id FROM masterdata_bank_account WHERE id = $1",
            )
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| e.to_string())?
        {
            return Ok(coa_id);
        }

        self.coa_id("111").await
    }

    async fn stock_available(&self, product_id: i64, warehouse_id: i64) -> Result<f64, String> {
        let qty = sqlx::query_scalar::<_, Option<f64>>(
            "SELECT quantity_on_hand::float8 FROM inventory_stock_balance
             WHERE product_id = $1 AND warehouse_id = $2",
        )
        .bind(product_id)
        .bind(warehouse_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?
        .flatten();

        Ok(qty.unwrap_or(0.0))
    }

    async fn invoiced_quantity(
        &self,
        doc_type: DocumentType,
        detail_id: i64,
    ) -> Result<f64, String> {
        let (detail_table, header_table, fk, reference_column) = match doc_type {
            DocumentType::SalesInvoice => (
                "transaction_sales_invoice_detail",
                "transaction_sales_invoice",
                "sales_invoice_id",
                "delivery_detail_id",
            ),
            DocumentType::PurchaseInvoice => (
                "transaction_purchase_invoice_detail",
                "transaction_purchase_invoice",
                "purchase_invoice_id",
                "goods_receipt_detail_id",
            ),
            _ => return Err("invoiced quantity is only supported for invoices".to_string()),
        };

        let quantity: f64 = sqlx::query_scalar(sql!(
            "SELECT COALESCE(SUM(d.quantity), 0)::float8
             FROM {detail_table} d
             JOIN {header_table} h ON h.id = d.{fk}
             WHERE d.{reference_column} = $1
               AND h.status <> 'rejected'"
        ))
        .bind(detail_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(quantity)
    }

    async fn next_number(&self, doc_type: DocumentType, date: NaiveDate) -> Result<String, String> {
        let prefix = doc_type.prefix();
        let like = format!("{}/{}/%", prefix, date.format("%Y%m%d"));
        let count: i64 = sqlx::query_scalar(sql!(
            "SELECT COUNT(*) FROM {} WHERE document_number LIKE $1",
            doc_type.header_table()
        ))
        .bind(&like)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(format!(
            "{}/{}/{:04}",
            prefix,
            date.format("%Y%m%d"),
            count + 1
        ))
    }

    async fn create_quotation(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_quotation(&mut tx, header).await?;
        insert_quotation_lines(&mut tx, id, lines).await?;
        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn create_sales_order(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_sales_order(&mut tx, header).await?;
        insert_sales_order_lines(&mut tx, id, lines).await?;

        let warehouse_id = header.warehouse_id.unwrap_or(1);
        let movement_lines: Vec<StockLine> = lines
            .iter()
            .filter_map(|line| {
                line.product_id.map(|product_id| StockLine {
                    product_id,
                    description: line.description.clone(),
                    quantity: line.quantity,
                    uom_id: line.uom_id.unwrap_or(1),
                    unit_cost: line.unit_cost,
                })
            })
            .collect();
        apply_stock(
            &mut tx,
            "OUT",
            &header.document_number,
            header.document_date,
            warehouse_id,
            "sales_order",
            id,
            header.prepared_by,
            &movement_lines,
        )
        .await?;

        let default_sales_id = self.coa_id("411").await?;
        let ar_id = self.coa_id("112").await?;
        let vat_id = self.coa_id("211").await?;

        let mut revenue_by_account: BTreeMap<i64, f64> = BTreeMap::new();
        for line in lines {
            let account_id = line.revenue_account_id.unwrap_or(default_sales_id);
            *revenue_by_account.entry(account_id).or_default() += line.subtotal;
        }

        let mut journal_lines = vec![JournalLine {
            coa_id: ar_id,
            description: format!("Receivable {}", header.document_number),
            debit: header.grand_total,
            credit: 0.0,
        }];
        for (coa_id, amount) in revenue_by_account {
            if amount.abs() < 0.005 {
                continue;
            }
            journal_lines.push(JournalLine {
                coa_id,
                description: "Sales revenue".to_string(),
                debit: 0.0,
                credit: amount,
            });
        }
        if header.tax_total > 0.0 {
            journal_lines.push(JournalLine {
                coa_id: vat_id,
                description: "VAT payable".to_string(),
                debit: 0.0,
                credit: header.tax_total,
            });
        }
        insert_journal(
            &mut tx,
            "sales",
            header.document_date,
            "sales_order",
            id,
            &format!("Sales order {}", header.document_number),
            header.prepared_by,
            &journal_lines,
        )
        .await?;

        let default_cogs_id = self.coa_id("500").await?;
        let default_inventory_id = self.coa_id("113").await?;
        let mut cogs_by_account: BTreeMap<i64, f64> = BTreeMap::new();
        let mut inventory_by_account: BTreeMap<i64, f64> = BTreeMap::new();
        for line in lines {
            let cost = line.unit_cost * line.quantity;
            if cost.abs() < 0.005 {
                continue;
            }
            let cogs_id = line.cogs_account_id.unwrap_or(default_cogs_id);
            let inventory_id = line.inventory_account_id.unwrap_or(default_inventory_id);
            *cogs_by_account.entry(cogs_id).or_default() += cost;
            *inventory_by_account.entry(inventory_id).or_default() += cost;
        }
        if !cogs_by_account.is_empty() {
            let mut cogs_lines = Vec::new();
            for (coa_id, amount) in cogs_by_account {
                cogs_lines.push(JournalLine {
                    coa_id,
                    description: "Cost of goods sold".to_string(),
                    debit: amount,
                    credit: 0.0,
                });
            }
            for (coa_id, amount) in inventory_by_account {
                cogs_lines.push(JournalLine {
                    coa_id,
                    description: "Inventory released".to_string(),
                    debit: 0.0,
                    credit: amount,
                });
            }
            insert_journal(
                &mut tx,
                "inventory",
                header.document_date,
                "sales_order",
                id,
                &format!("COGS for sales order {}", header.document_number),
                header.prepared_by,
                &cogs_lines,
            )
            .await?;
        }

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn create_delivery(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_delivery(&mut tx, header).await?;
        insert_delivery_lines(&mut tx, id, lines).await?;

        for line in lines {
            if let Some(parent_id) = line.parent_detail_id {
                sqlx::query(
                    "UPDATE transaction_sales_order_detail
                     SET quantity_delivered = quantity_delivered + $2::numeric
                     WHERE id = $1",
                )
                .bind(parent_id)
                .bind(line.quantity)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
            }
        }

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn create_sales_invoice(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_sales_invoice(&mut tx, header).await?;
        insert_sales_invoice_lines(&mut tx, id, lines).await?;

        for line in lines {
            if let Some(parent_id) = line.parent_detail_id {
                sqlx::query(
                    "UPDATE transaction_sales_order_detail
                     SET quantity_invoiced = quantity_invoiced + $2::numeric
                     WHERE id = $1",
                )
                .bind(parent_id)
                .bind(line.quantity)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
            }
        }

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn create_customer_receipt(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_customer_receipt(&mut tx, header).await?;
        insert_customer_receipt_lines(&mut tx, id, lines).await?;

        for line in lines {
            if let Some(invoice_id) = line.sales_invoice_id {
                update_sales_invoice_paid(&mut tx, invoice_id, line.amount).await?;
            }
        }

        let ar_id = self.coa_id("112").await?;
        let cash_id = self.bank_coa_id(header.bank_account_id).await?;
        let journal_id = insert_journal(
            &mut tx,
            "payment",
            header.document_date,
            "customer_receipt",
            id,
            &format!("Customer receipt {}", header.document_number),
            header.prepared_by,
            &[
                JournalLine {
                    coa_id: cash_id,
                    description: "Cash received".to_string(),
                    debit: header.total_amount,
                    credit: 0.0,
                },
                JournalLine {
                    coa_id: ar_id,
                    description: "Receivable settled".to_string(),
                    debit: 0.0,
                    credit: header.total_amount,
                },
            ],
        )
        .await?;

        sqlx::query("UPDATE transaction_customer_receipt SET journal_id = $2 WHERE id = $1")
            .bind(id)
            .bind(journal_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn create_purchase_order(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_purchase_order(&mut tx, header).await?;
        insert_purchase_order_lines(&mut tx, id, lines).await?;

        let warehouse_id = header.warehouse_id.unwrap_or(1);
        let movement_lines: Vec<StockLine> = lines
            .iter()
            .filter_map(|line| {
                line.product_id.map(|product_id| StockLine {
                    product_id,
                    description: line.description.clone(),
                    quantity: line.quantity,
                    uom_id: line.uom_id.unwrap_or(1),
                    unit_cost: line.unit_cost,
                })
            })
            .collect();
        apply_stock(
            &mut tx,
            "IN",
            &header.document_number,
            header.document_date,
            warehouse_id,
            "purchase_order",
            id,
            header.prepared_by,
            &movement_lines,
        )
        .await?;

        let default_inventory_id = self.coa_id("113").await?;
        let ap_id = self.coa_id("210").await?;
        let vat_id = self.coa_id("211").await?;

        let mut inventory_by_account: BTreeMap<i64, f64> = BTreeMap::new();
        for line in lines {
            let account_id = line.inventory_account_id.unwrap_or(default_inventory_id);
            *inventory_by_account.entry(account_id).or_default() += line.subtotal;
        }

        let mut journal_lines = Vec::new();
        for (coa_id, amount) in inventory_by_account {
            if amount.abs() < 0.005 {
                continue;
            }
            journal_lines.push(JournalLine {
                coa_id,
                description: "Inventory received".to_string(),
                debit: amount,
                credit: 0.0,
            });
        }
        if header.tax_total > 0.0 {
            journal_lines.push(JournalLine {
                coa_id: vat_id,
                description: "VAT receivable".to_string(),
                debit: header.tax_total,
                credit: 0.0,
            });
        }
        journal_lines.push(JournalLine {
            coa_id: ap_id,
            description: "Accounts payable".to_string(),
            debit: 0.0,
            credit: header.grand_total,
        });
        insert_journal(
            &mut tx,
            "purchase",
            header.document_date,
            "purchase_order",
            id,
            &format!("Purchase order {}", header.document_number),
            header.prepared_by,
            &journal_lines,
        )
        .await?;

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn create_goods_receipt(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_goods_receipt(&mut tx, header).await?;
        insert_goods_receipt_lines(&mut tx, id, lines).await?;

        for line in lines {
            if let Some(parent_id) = line.parent_detail_id {
                sqlx::query(
                    "UPDATE transaction_purchase_order_detail
                     SET quantity_received = quantity_received + $2::numeric
                     WHERE id = $1",
                )
                .bind(parent_id)
                .bind(line.quantity)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
            }
        }

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn create_purchase_invoice(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_purchase_invoice(&mut tx, header).await?;
        insert_purchase_invoice_lines(&mut tx, id, lines).await?;

        for line in lines {
            if let Some(parent_id) = line.parent_detail_id {
                sqlx::query(
                    "UPDATE transaction_purchase_order_detail
                     SET quantity_invoiced = quantity_invoiced + $2::numeric
                     WHERE id = $1",
                )
                .bind(parent_id)
                .bind(line.quantity)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
            }
        }

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn create_vendor_payment(
        &self,
        header: &PreparedHeader,
        lines: &[PreparedLine],
    ) -> Result<i64, String> {
        let mut tx = self.pool.begin().await.map_err(|e| e.to_string())?;
        let id = insert_vendor_payment(&mut tx, header).await?;
        insert_vendor_payment_lines(&mut tx, id, lines).await?;

        for line in lines {
            if let Some(invoice_id) = line.purchase_invoice_id {
                update_purchase_invoice_paid(&mut tx, invoice_id, line.amount).await?;
            }
        }

        let ap_id = self.coa_id("210").await?;
        let cash_id = self.bank_coa_id(header.bank_account_id).await?;
        let journal_id = insert_journal(
            &mut tx,
            "payment",
            header.document_date,
            "vendor_payment",
            id,
            &format!("Vendor payment {}", header.document_number),
            header.prepared_by,
            &[
                JournalLine {
                    coa_id: ap_id,
                    description: "Accounts payable settled".to_string(),
                    debit: header.total_amount,
                    credit: 0.0,
                },
                JournalLine {
                    coa_id: cash_id,
                    description: "Cash paid".to_string(),
                    debit: 0.0,
                    credit: header.total_amount,
                },
            ],
        )
        .await?;

        sqlx::query("UPDATE transaction_vendor_payment SET journal_id = $2 WHERE id = $1")
            .bind(id)
            .bind(journal_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        tx.commit().await.map_err(|e| e.to_string())?;
        Ok(id)
    }

    async fn approve(
        &self,
        doc_type: DocumentType,
        id: i64,
        actor_id: Option<i64>,
    ) -> Result<(), String> {
        let table = doc_type.header_table();
        sqlx::query(sql!(
            "UPDATE {table}
             SET status = 'approved', approved_by = $2, approved_at = now(), updated_at = now()
             WHERE id = $1"
        ))
        .bind(id)
        .bind(actor_id)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }
}

#[derive(Debug, Clone)]
struct StockLine {
    product_id: i64,
    description: Option<String>,
    quantity: f64,
    uom_id: i64,
    unit_cost: f64,
}

async fn insert_quotation(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_quotation
         (document_number, transaction_number, document_date, valid_until, customer_id, salesperson_id,
          prepared_by, payment_term_id, tax_rate_id, currency_code, exchange_rate, subtotal, discount_total,
          tax_total, shipping_cost, grand_total, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::numeric,$13::numeric,$14::numeric,$15::numeric,$16::numeric,$17,$18)
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(&h.transaction_number)
    .bind(h.document_date)
    .bind(h.valid_until)
    .bind(h.customer_id)
    .bind(h.salesperson_id)
    .bind(h.prepared_by)
    .bind(h.payment_term_id)
    .bind(h.tax_rate_id)
    .bind(&h.currency_code)
    .bind(h.exchange_rate)
    .bind(h.subtotal)
    .bind(h.discount_total)
    .bind(h.tax_total)
    .bind(h.shipping_cost)
    .bind(h.grand_total)
    .bind(&h.status)
    .bind(&h.notes)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_quotation_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_quotation_detail
             (quotation_id, line_number, product_id, description, quantity, uom_id, unit_price,
              discount_percent, discount_amount, tax_rate_id, tax_amount, subtotal, total)
             VALUES ($1,$2,$3,$4,$5::numeric,$6,$7::numeric,$8::numeric,$9::numeric,$10,$11::numeric,$12::numeric,$13::numeric)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.product_id)
        .bind(&line.description)
        .bind(line.quantity)
        .bind(line.uom_id)
        .bind(line.unit_price)
        .bind(line.discount_percent)
        .bind(line.discount_amount)
        .bind(line.tax_rate_id)
        .bind(line.tax_amount)
        .bind(line.subtotal)
        .bind(line.total)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn insert_sales_order(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_sales_order
         (document_number, transaction_number, document_date, delivery_date, customer_id, quotation_id,
          warehouse_id, payment_term_id, tax_rate_id, salesperson_id, prepared_by, currency_code, exchange_rate,
          subtotal, discount_total, tax_total, shipping_cost, grand_total, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::numeric,$15::numeric,$16::numeric,$17::numeric,$18::numeric,$19,$20)
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(&h.transaction_number)
    .bind(h.document_date)
    .bind(h.delivery_date)
    .bind(h.customer_id)
    .bind(h.quotation_id)
    .bind(h.warehouse_id)
    .bind(h.payment_term_id)
    .bind(h.tax_rate_id)
    .bind(h.salesperson_id)
    .bind(h.prepared_by)
    .bind(&h.currency_code)
    .bind(h.exchange_rate)
    .bind(h.subtotal)
    .bind(h.discount_total)
    .bind(h.tax_total)
    .bind(h.shipping_cost)
    .bind(h.grand_total)
    .bind(&h.status)
    .bind(&h.notes)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_sales_order_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_sales_order_detail
             (sales_order_id, line_number, product_id, description, quantity, uom_id, unit_price,
              discount_percent, discount_amount, tax_rate_id, tax_amount, subtotal, total,
              quantity_delivered, quantity_invoiced)
             VALUES ($1,$2,$3,$4,$5::numeric,$6,$7::numeric,$8::numeric,$9::numeric,$10,$11::numeric,$12::numeric,$13::numeric,0,0)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.product_id)
        .bind(&line.description)
        .bind(line.quantity)
        .bind(line.uom_id)
        .bind(line.unit_price)
        .bind(line.discount_percent)
        .bind(line.discount_amount)
        .bind(line.tax_rate_id)
        .bind(line.tax_amount)
        .bind(line.subtotal)
        .bind(line.total)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn insert_delivery(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_delivery
         (document_number, document_date, sales_order_id, customer_id, warehouse_id, shipping_address, status, prepared_by, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(h.document_date)
    .bind(h.sales_order_id)
    .bind(h.customer_id)
    .bind(h.warehouse_id)
    .bind(&h.shipping_address)
    .bind(&h.status)
    .bind(h.prepared_by)
    .bind(&h.notes)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_delivery_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_delivery_detail
             (delivery_id, line_number, sales_order_detail_id, product_id, description, quantity, uom_id, weight_kg)
             VALUES ($1,$2,$3,$4,$5,$6::numeric,$7,$8::numeric)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.parent_detail_id)
        .bind(line.product_id)
        .bind(&line.description)
        .bind(line.quantity)
        .bind(line.uom_id)
        .bind(line.weight_kg.unwrap_or(0.0))
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn insert_sales_invoice(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_sales_invoice
         (document_number, document_date, due_date, customer_id, sales_order_id, delivery_id,
          payment_term_id, tax_rate_id, prepared_by, currency_code, exchange_rate, subtotal,
          discount_total, tax_total, shipping_cost, grand_total, paid_amount, outstanding_amount, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::numeric,$13::numeric,$14::numeric,$15::numeric,$16::numeric,0,$16::numeric,$17,$18)
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(h.document_date)
    .bind(h.due_date)
    .bind(h.customer_id)
    .bind(h.sales_order_id)
    .bind(h.delivery_id)
    .bind(h.payment_term_id)
    .bind(h.tax_rate_id)
    .bind(h.prepared_by)
    .bind(&h.currency_code)
    .bind(h.exchange_rate)
    .bind(h.subtotal)
    .bind(h.discount_total)
    .bind(h.tax_total)
    .bind(h.shipping_cost)
    .bind(h.grand_total)
    .bind(&h.status)
    .bind(&h.notes)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_sales_invoice_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_sales_invoice_detail
             (sales_invoice_id, line_number, delivery_detail_id, product_id, description, quantity, uom_id,
              unit_price, discount_percent, discount_amount, tax_rate_id, tax_amount, subtotal, total, revenue_account_id)
             VALUES ($1,$2,$3,$4,$5,$6::numeric,$7,$8::numeric,$9::numeric,$10::numeric,$11,$12::numeric,$13::numeric,$14::numeric,$15)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.reference_detail_id.or(line.parent_detail_id))
        .bind(line.product_id)
        .bind(&line.description)
        .bind(line.quantity)
        .bind(line.uom_id)
        .bind(line.unit_price)
        .bind(line.discount_percent)
        .bind(line.discount_amount)
        .bind(line.tax_rate_id)
        .bind(line.tax_amount)
        .bind(line.subtotal)
        .bind(line.total)
        .bind(line.revenue_account_id)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn insert_customer_receipt(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_customer_receipt
         (document_number, document_date, customer_id, payment_method, bank_account_id, reference_number,
          total_amount, allocated_amount, unallocated_amount, status, notes, prepared_by, posted_by, posted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7::numeric,$8::numeric,$9::numeric,$10,$11,$12,$12,now())
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(h.document_date)
    .bind(h.customer_id)
    .bind(&h.payment_method)
    .bind(h.bank_account_id)
    .bind(&h.reference_number)
    .bind(h.total_amount)
    .bind(h.allocated_amount)
    .bind(h.unallocated_amount)
    .bind(&h.status)
    .bind(&h.notes)
    .bind(h.prepared_by)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_customer_receipt_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_customer_receipt_detail
             (customer_receipt_id, line_number, sales_invoice_id, amount, discount_amount, notes)
             VALUES ($1,$2,$3,$4::numeric,0,$5)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.sales_invoice_id)
        .bind(line.amount)
        .bind(&line.description)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn insert_purchase_order(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_purchase_order
         (document_number, transaction_number, document_date, expected_date, supplier_id, warehouse_id,
          payment_term_id, tax_rate_id, prepared_by, currency_code, exchange_rate, subtotal, discount_total,
          tax_total, shipping_cost, grand_total, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::numeric,$13::numeric,$14::numeric,$15::numeric,$16::numeric,$17,$18)
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(&h.transaction_number)
    .bind(h.document_date)
    .bind(h.expected_date)
    .bind(h.supplier_id)
    .bind(h.warehouse_id)
    .bind(h.payment_term_id)
    .bind(h.tax_rate_id)
    .bind(h.prepared_by)
    .bind(&h.currency_code)
    .bind(h.exchange_rate)
    .bind(h.subtotal)
    .bind(h.discount_total)
    .bind(h.tax_total)
    .bind(h.shipping_cost)
    .bind(h.grand_total)
    .bind(&h.status)
    .bind(&h.notes)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_purchase_order_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_purchase_order_detail
             (purchase_order_id, line_number, product_id, description, quantity, uom_id, unit_price,
              discount_percent, discount_amount, tax_rate_id, tax_amount, subtotal, total,
              quantity_received, quantity_invoiced)
             VALUES ($1,$2,$3,$4,$5::numeric,$6,$7::numeric,$8::numeric,$9::numeric,$10,$11::numeric,$12::numeric,$13::numeric,0,0)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.product_id)
        .bind(&line.description)
        .bind(line.quantity)
        .bind(line.uom_id)
        .bind(line.unit_price)
        .bind(line.discount_percent)
        .bind(line.discount_amount)
        .bind(line.tax_rate_id)
        .bind(line.tax_amount)
        .bind(line.subtotal)
        .bind(line.total)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn insert_goods_receipt(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_goods_receipt
         (document_number, document_date, purchase_order_id, supplier_id, warehouse_id, status, notes, prepared_by, posted_by, posted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,now())
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(h.document_date)
    .bind(h.purchase_order_id)
    .bind(h.supplier_id)
    .bind(h.warehouse_id)
    .bind(&h.status)
    .bind(&h.notes)
    .bind(h.prepared_by)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_goods_receipt_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_goods_receipt_detail
             (goods_receipt_id, line_number, purchase_order_detail_id, product_id, description, quantity, uom_id,
              unit_cost, weight_kg, batch_number, expiry_date)
             VALUES ($1,$2,$3,$4,$5,$6::numeric,$7,$8::numeric,$9::numeric,NULL,NULL)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.parent_detail_id)
        .bind(line.product_id)
        .bind(&line.description)
        .bind(line.quantity)
        .bind(line.uom_id)
        .bind(line.unit_cost)
        .bind(line.weight_kg.unwrap_or(0.0))
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn insert_purchase_invoice(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_purchase_invoice
         (document_number, document_date, due_date, supplier_id, purchase_order_id, goods_receipt_id,
          payment_term_id, tax_rate_id, prepared_by, currency_code, exchange_rate, subtotal, discount_total,
          tax_total, shipping_cost, grand_total, paid_amount, outstanding_amount, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::numeric,$13::numeric,$14::numeric,$15::numeric,$16::numeric,0,$16::numeric,$17,$18)
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(h.document_date)
    .bind(h.due_date)
    .bind(h.supplier_id)
    .bind(h.purchase_order_id)
    .bind(h.goods_receipt_id)
    .bind(h.payment_term_id)
    .bind(h.tax_rate_id)
    .bind(h.prepared_by)
    .bind(&h.currency_code)
    .bind(h.exchange_rate)
    .bind(h.subtotal)
    .bind(h.discount_total)
    .bind(h.tax_total)
    .bind(h.shipping_cost)
    .bind(h.grand_total)
    .bind(&h.status)
    .bind(&h.notes)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_purchase_invoice_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_purchase_invoice_detail
             (purchase_invoice_id, line_number, goods_receipt_detail_id, product_id, description, quantity, uom_id,
              unit_price, discount_percent, discount_amount, tax_rate_id, tax_amount, subtotal, total, expense_account_id)
             VALUES ($1,$2,$3,$4,$5,$6::numeric,$7,$8::numeric,$9::numeric,$10::numeric,$11,$12::numeric,$13::numeric,$14::numeric,$15)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.reference_detail_id.or(line.parent_detail_id))
        .bind(line.product_id)
        .bind(&line.description)
        .bind(line.quantity)
        .bind(line.uom_id)
        .bind(line.unit_price)
        .bind(line.discount_percent)
        .bind(line.discount_amount)
        .bind(line.tax_rate_id)
        .bind(line.tax_amount)
        .bind(line.subtotal)
        .bind(line.total)
        .bind(line.expense_account_id)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn insert_vendor_payment(
    tx: &mut Transaction<'_, Postgres>,
    h: &PreparedHeader,
) -> Result<i64, String> {
    sqlx::query_scalar(
        "INSERT INTO transaction_vendor_payment
         (document_number, document_date, supplier_id, payment_method, bank_account_id, reference_number,
          total_amount, allocated_amount, unallocated_amount, status, notes, prepared_by, posted_by, posted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7::numeric,$8::numeric,$9::numeric,$10,$11,$12,$12,now())
         RETURNING id",
    )
    .bind(&h.document_number)
    .bind(h.document_date)
    .bind(h.supplier_id)
    .bind(&h.payment_method)
    .bind(h.bank_account_id)
    .bind(&h.reference_number)
    .bind(h.total_amount)
    .bind(h.allocated_amount)
    .bind(h.unallocated_amount)
    .bind(&h.status)
    .bind(&h.notes)
    .bind(h.prepared_by)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn insert_vendor_payment_lines(
    tx: &mut Transaction<'_, Postgres>,
    id: i64,
    lines: &[PreparedLine],
) -> Result<(), String> {
    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO transaction_vendor_payment_detail
             (vendor_payment_id, line_number, purchase_invoice_id, amount, notes)
             VALUES ($1,$2,$3,$4::numeric,$5)",
        )
        .bind(id)
        .bind((idx + 1) as i32)
        .bind(line.purchase_invoice_id)
        .bind(line.amount)
        .bind(&line.description)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[allow(clippy::too_many_arguments)]
async fn apply_stock(
    tx: &mut Transaction<'_, Postgres>,
    movement_type: &str,
    reference_number: &str,
    document_date: NaiveDate,
    warehouse_id: i64,
    reference_type: &str,
    reference_id: i64,
    prepared_by: Option<i64>,
    lines: &[StockLine],
) -> Result<(), String> {
    let movement_number = format!("SM/{movement_type}/{reference_number}");
    let movement_id: i64 = sqlx::query_scalar(
        "INSERT INTO inventory_stock_movement
         (document_number, document_date, movement_type, reference_type, reference_id, warehouse_id,
          status, notes, prepared_by, posted_by, posted_at)
         VALUES ($1,$2,$3,$4,$5,$6,'completed',$7,$8,$8,now())
         RETURNING id",
    )
    .bind(&movement_number)
    .bind(document_date)
    .bind(movement_type)
    .bind(reference_type)
    .bind(reference_id)
    .bind(warehouse_id)
    .bind(format!("Stock movement for {reference_number}"))
    .bind(prepared_by)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())?;

    for (idx, line) in lines.iter().enumerate() {
        let total_cost = line.quantity * line.unit_cost;
        sqlx::query(
            "INSERT INTO inventory_stock_movement_detail
             (movement_id, line_number, product_id, description, quantity, uom_id, unit_cost, total_cost)
             VALUES ($1,$2,$3,$4,$5::numeric,$6,$7::numeric,$8::numeric)",
        )
        .bind(movement_id)
        .bind((idx + 1) as i32)
        .bind(line.product_id)
        .bind(&line.description)
        .bind(line.quantity)
        .bind(line.uom_id)
        .bind(line.unit_cost)
        .bind(total_cost)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

        let current: Option<(f64, f64)> = sqlx::query_as(
            "SELECT quantity_on_hand::float8, average_cost::float8
             FROM inventory_stock_balance
             WHERE product_id = $1 AND warehouse_id = $2
             FOR UPDATE",
        )
        .bind(line.product_id)
        .bind(warehouse_id)
        .fetch_optional(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

        let (qty_on_hand, avg_cost) = current.unwrap_or((0.0, 0.0));

        if movement_type == "OUT" {
            if qty_on_hand + 0.0001 < line.quantity {
                return Err(format!(
                    "insufficient stock for product {} in warehouse {}: on hand {}, requested {}",
                    line.product_id, warehouse_id, qty_on_hand, line.quantity
                ));
            }
            sqlx::query(
                "UPDATE inventory_stock_balance
                 SET quantity_on_hand = quantity_on_hand - $3::numeric,
                     last_movement_at = now(), updated_at = now()
                 WHERE product_id = $1 AND warehouse_id = $2",
            )
            .bind(line.product_id)
            .bind(warehouse_id)
            .bind(line.quantity)
            .execute(&mut **tx)
            .await
            .map_err(|e| e.to_string())?;
        } else {
            let new_qty = qty_on_hand + line.quantity;
            let new_avg = if new_qty > 0.0 {
                ((qty_on_hand * avg_cost) + (line.quantity * line.unit_cost)) / new_qty
            } else {
                line.unit_cost
            };
            sqlx::query(
                "INSERT INTO inventory_stock_balance
                 (product_id, warehouse_id, quantity_on_hand, quantity_reserved, average_cost, last_movement_at)
                 VALUES ($1,$2,$3::numeric,0,$4::numeric,now())
                 ON CONFLICT (product_id, warehouse_id) DO UPDATE SET
                   quantity_on_hand = inventory_stock_balance.quantity_on_hand + EXCLUDED.quantity_on_hand,
                   average_cost = $4::numeric,
                   last_movement_at = now(),
                   updated_at = now()",
            )
            .bind(line.product_id)
            .bind(warehouse_id)
            .bind(line.quantity)
            .bind(new_avg)
            .execute(&mut **tx)
            .await
            .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[allow(clippy::too_many_arguments)]
async fn insert_journal(
    tx: &mut Transaction<'_, Postgres>,
    journal_type: &str,
    document_date: NaiveDate,
    reference_type: &str,
    reference_id: i64,
    description: &str,
    created_by: Option<i64>,
    lines: &[JournalLine],
) -> Result<i64, String> {
    let total_debit: f64 = lines.iter().map(|l| l.debit).sum();
    let total_credit: f64 = lines.iter().map(|l| l.credit).sum();
    let journal_number = format!(
        "JV/{}/{}/{}",
        journal_type.to_uppercase(),
        document_date.format("%Y%m%d"),
        Utc::now().timestamp_nanos_opt().unwrap_or_default()
    );

    let journal_id: i64 = sqlx::query_scalar(
        "INSERT INTO accounting_journal
         (journal_number, journal_date, journal_type, reference_type, reference_id, description,
          total_debit, total_credit, status, posted_by, posted_at, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7::numeric,$8::numeric,'completed',$9,now(),$9)
         RETURNING id",
    )
    .bind(&journal_number)
    .bind(document_date)
    .bind(journal_type)
    .bind(reference_type)
    .bind(reference_id)
    .bind(description)
    .bind(total_debit)
    .bind(total_credit)
    .bind(created_by)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())?;

    for (idx, line) in lines.iter().enumerate() {
        sqlx::query(
            "INSERT INTO accounting_journal_detail
             (journal_id, line_number, coa_id, description, debit, credit)
             VALUES ($1,$2,$3,$4,$5::numeric,$6::numeric)",
        )
        .bind(journal_id)
        .bind((idx + 1) as i32)
        .bind(line.coa_id)
        .bind(&line.description)
        .bind(line.debit)
        .bind(line.credit)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(journal_id)
}

async fn update_sales_invoice_paid(
    tx: &mut Transaction<'_, Postgres>,
    invoice_id: i64,
    amount: f64,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE transaction_sales_invoice
         SET paid_amount = paid_amount + $2::numeric,
             outstanding_amount = grand_total - (paid_amount + $2::numeric),
             status = CASE WHEN grand_total - (paid_amount + $2::numeric) <= 0 THEN 'completed' ELSE status END,
             updated_at = now()
         WHERE id = $1",
    )
    .bind(invoice_id)
    .bind(amount)
    .execute(&mut **tx)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

async fn update_purchase_invoice_paid(
    tx: &mut Transaction<'_, Postgres>,
    invoice_id: i64,
    amount: f64,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE transaction_purchase_invoice
         SET paid_amount = paid_amount + $2::numeric,
             outstanding_amount = grand_total - (paid_amount + $2::numeric),
             status = CASE WHEN grand_total - (paid_amount + $2::numeric) <= 0 THEN 'completed' ELSE status END,
             updated_at = now()
         WHERE id = $1",
    )
    .bind(invoice_id)
    .bind(amount)
    .execute(&mut **tx)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}
