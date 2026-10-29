use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Jenis dokumen transaksi yang didukung oleh engine transaksi.
///
/// Urutan rantai penjualan:
/// quotation -> sales-order -> delivery -> sales-invoice -> customer-receipt
///
/// Urutan rantai pembelian:
/// purchase-order -> goods-receipt -> purchase-invoice -> vendor-payment
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum DocumentType {
    Quotation,
    SalesOrder,
    Delivery,
    SalesInvoice,
    CustomerReceipt,
    PurchaseOrder,
    GoodsReceipt,
    PurchaseInvoice,
    VendorPayment,
}

impl DocumentType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Quotation => "quotation",
            Self::SalesOrder => "sales-order",
            Self::Delivery => "delivery",
            Self::SalesInvoice => "sales-invoice",
            Self::CustomerReceipt => "customer-receipt",
            Self::PurchaseOrder => "purchase-order",
            Self::GoodsReceipt => "goods-receipt",
            Self::PurchaseInvoice => "purchase-invoice",
            Self::VendorPayment => "vendor-payment",
        }
    }

    pub fn prefix(self) -> &'static str {
        match self {
            Self::Quotation => "QUO",
            Self::SalesOrder => "SO",
            Self::Delivery => "DO",
            Self::SalesInvoice => "INV",
            Self::CustomerReceipt => "RCPT",
            Self::PurchaseOrder => "PO",
            Self::GoodsReceipt => "GR",
            Self::PurchaseInvoice => "PINV",
            Self::VendorPayment => "PAY",
        }
    }

    pub fn header_table(self) -> &'static str {
        match self {
            Self::Quotation => "transaction_quotation",
            Self::SalesOrder => "transaction_sales_order",
            Self::Delivery => "transaction_delivery",
            Self::SalesInvoice => "transaction_sales_invoice",
            Self::CustomerReceipt => "transaction_customer_receipt",
            Self::PurchaseOrder => "transaction_purchase_order",
            Self::GoodsReceipt => "transaction_goods_receipt",
            Self::PurchaseInvoice => "transaction_purchase_invoice",
            Self::VendorPayment => "transaction_vendor_payment",
        }
    }

    pub fn detail_table(self) -> &'static str {
        match self {
            Self::Quotation => "transaction_quotation_detail",
            Self::SalesOrder => "transaction_sales_order_detail",
            Self::Delivery => "transaction_delivery_detail",
            Self::SalesInvoice => "transaction_sales_invoice_detail",
            Self::CustomerReceipt => "transaction_customer_receipt_detail",
            Self::PurchaseOrder => "transaction_purchase_order_detail",
            Self::GoodsReceipt => "transaction_goods_receipt_detail",
            Self::PurchaseInvoice => "transaction_purchase_invoice_detail",
            Self::VendorPayment => "transaction_vendor_payment_detail",
        }
    }

    pub fn detail_fk(self) -> &'static str {
        match self {
            Self::Quotation => "quotation_id",
            Self::SalesOrder => "sales_order_id",
            Self::Delivery => "delivery_id",
            Self::SalesInvoice => "sales_invoice_id",
            Self::CustomerReceipt => "customer_receipt_id",
            Self::PurchaseOrder => "purchase_order_id",
            Self::GoodsReceipt => "goods_receipt_id",
            Self::PurchaseInvoice => "purchase_invoice_id",
            Self::VendorPayment => "vendor_payment_id",
        }
    }

    pub fn parent_type(self) -> Option<Self> {
        match self {
            Self::SalesOrder => Some(Self::Quotation),
            Self::Delivery => Some(Self::SalesOrder),
            Self::SalesInvoice => Some(Self::Delivery),
            Self::CustomerReceipt => Some(Self::SalesInvoice),
            Self::GoodsReceipt => Some(Self::PurchaseOrder),
            Self::PurchaseInvoice => Some(Self::GoodsReceipt),
            Self::VendorPayment => Some(Self::PurchaseInvoice),
            Self::Quotation | Self::PurchaseOrder => None,
        }
    }

    pub fn is_approvable(self) -> bool {
        matches!(
            self,
            Self::Quotation | Self::SalesOrder | Self::PurchaseOrder
        )
    }

    pub fn is_auto_posted(self) -> bool {
        !self.is_approvable()
    }

    pub fn is_sales(self) -> bool {
        matches!(
            self,
            Self::Quotation
                | Self::SalesOrder
                | Self::Delivery
                | Self::SalesInvoice
                | Self::CustomerReceipt
        )
    }

    /// Human-readable label used in audit entries and UI copy.
    pub fn label(self) -> &'static str {
        match self {
            Self::Quotation => "Sales Quotation",
            Self::SalesOrder => "Sales Order",
            Self::Delivery => "Delivery Ticket",
            Self::SalesInvoice => "Sales Invoice",
            Self::CustomerReceipt => "Customer Receipt",
            Self::PurchaseOrder => "Purchase Order",
            Self::GoodsReceipt => "Goods Receipt Ticket",
            Self::PurchaseInvoice => "Purchase Invoice",
            Self::VendorPayment => "Vendor Payment",
        }
    }
}

impl std::fmt::Display for DocumentType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateTransactionDto {
    #[serde(default)]
    pub document_number: Option<String>,
    pub document_date: NaiveDate,
    #[serde(default)]
    pub due_date: Option<NaiveDate>,
    #[serde(default)]
    pub valid_until: Option<NaiveDate>,
    #[serde(default)]
    pub expected_date: Option<NaiveDate>,
    #[serde(default)]
    pub delivery_date: Option<NaiveDate>,
    #[serde(default)]
    pub customer_id: Option<i64>,
    #[serde(default)]
    pub supplier_id: Option<i64>,
    #[serde(default)]
    pub warehouse_id: Option<i64>,
    #[serde(default)]
    pub quotation_id: Option<i64>,
    #[serde(default)]
    pub sales_order_id: Option<i64>,
    #[serde(default)]
    pub delivery_id: Option<i64>,
    #[serde(default)]
    pub purchase_order_id: Option<i64>,
    #[serde(default)]
    pub goods_receipt_id: Option<i64>,
    #[serde(default)]
    pub payment_term_id: Option<i64>,
    #[serde(default)]
    pub tax_rate_id: Option<i64>,
    #[serde(default)]
    pub salesperson_id: Option<i64>,
    #[serde(default)]
    pub prepared_by: Option<i64>,
    #[serde(default)]
    pub bank_account_id: Option<i64>,
    #[serde(default)]
    pub payment_method: Option<String>,
    #[serde(default)]
    pub reference_number: Option<String>,
    #[serde(default)]
    pub shipping_address: Option<String>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub lines: Vec<CreateTransactionLineDto>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTransactionLineDto {
    #[serde(default)]
    pub product_id: Option<i64>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub quantity: Option<f64>,
    #[serde(default)]
    pub uom_id: Option<i64>,
    #[serde(default)]
    pub unit_price: Option<f64>,
    #[serde(default)]
    pub unit_cost: Option<f64>,
    #[serde(default)]
    pub discount_percent: Option<f64>,
    #[serde(default)]
    pub tax_rate_id: Option<i64>,
    /// Untuk customer receipt / vendor payment: invoice yang dibayar.
    #[serde(default)]
    pub sales_invoice_id: Option<i64>,
    #[serde(default)]
    pub purchase_invoice_id: Option<i64>,
    #[serde(default)]
    pub amount: Option<f64>,
    /// Untuk delivery / goods receipt parsial: detail dokumen induk.
    #[serde(default)]
    pub parent_detail_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct ListTransactionsQuery {
    #[serde(default)]
    pub search: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub page: Option<u64>,
    #[serde(default)]
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct ApproveTransactionDto {
    #[serde(default)]
    pub actor: Option<String>,
    #[serde(default)]
    pub actor_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize)]
pub struct TransactionResponse {
    #[serde(rename = "documentType")]
    pub document_type: String,
    pub header: Value,
    pub lines: Vec<Value>,
}

#[derive(Debug, Clone)]
pub struct PreparedHeader {
    pub document_number: String,
    pub transaction_number: String,
    pub document_date: NaiveDate,
    pub due_date: Option<NaiveDate>,
    pub valid_until: Option<NaiveDate>,
    pub expected_date: Option<NaiveDate>,
    pub delivery_date: Option<NaiveDate>,
    pub customer_id: Option<i64>,
    pub supplier_id: Option<i64>,
    pub warehouse_id: Option<i64>,
    pub quotation_id: Option<i64>,
    pub sales_order_id: Option<i64>,
    pub delivery_id: Option<i64>,
    pub purchase_order_id: Option<i64>,
    pub goods_receipt_id: Option<i64>,
    pub payment_term_id: Option<i64>,
    pub tax_rate_id: Option<i64>,
    pub salesperson_id: Option<i64>,
    pub prepared_by: Option<i64>,
    pub bank_account_id: Option<i64>,
    pub payment_method: Option<String>,
    pub reference_number: Option<String>,
    pub shipping_address: Option<String>,
    pub notes: Option<String>,
    pub currency_code: String,
    pub exchange_rate: f64,
    pub subtotal: f64,
    pub discount_total: f64,
    pub tax_total: f64,
    pub shipping_cost: f64,
    pub grand_total: f64,
    pub total_amount: f64,
    pub allocated_amount: f64,
    pub unallocated_amount: f64,
    pub status: String,
}

#[derive(Debug, Clone, Default)]
pub struct PreparedLine {
    pub product_id: Option<i64>,
    pub description: Option<String>,
    pub quantity: f64,
    pub uom_id: Option<i64>,
    pub unit_price: f64,
    pub unit_cost: f64,
    pub discount_percent: f64,
    pub discount_amount: f64,
    pub tax_rate_id: Option<i64>,
    pub tax_amount: f64,
    pub subtotal: f64,
    pub total: f64,
    pub parent_detail_id: Option<i64>,
    /// Detail dokumen sumber untuk baris invoice (delivery detail / goods receipt detail).
    pub reference_detail_id: Option<i64>,
    pub sales_invoice_id: Option<i64>,
    pub purchase_invoice_id: Option<i64>,
    pub amount: f64,
    pub weight_kg: Option<f64>,
    pub revenue_account_id: Option<i64>,
    pub expense_account_id: Option<i64>,
    pub inventory_account_id: Option<i64>,
    pub cogs_account_id: Option<i64>,
}

#[derive(Debug, Clone)]
pub struct HeaderSnapshot {
    pub id: i64,
    pub document_number: String,
    pub document_date: NaiveDate,
    pub customer_id: Option<i64>,
    pub supplier_id: Option<i64>,
    pub warehouse_id: Option<i64>,
    pub status: String,
    pub payment_term_id: Option<i64>,
    pub tax_rate_id: Option<i64>,
    pub salesperson_id: Option<i64>,
    pub grand_total: f64,
    pub paid_amount: f64,
    pub outstanding_amount: f64,
    pub quotation_id: Option<i64>,
    pub sales_order_id: Option<i64>,
    pub delivery_id: Option<i64>,
    pub purchase_order_id: Option<i64>,
    pub goods_receipt_id: Option<i64>,
}

#[derive(Debug, Clone)]
pub struct LineSnapshot {
    pub id: i64,
    pub line_number: i32,
    pub product_id: Option<i64>,
    pub description: Option<String>,
    pub quantity: f64,
    pub uom_id: Option<i64>,
    pub unit_price: f64,
    pub unit_cost: f64,
    pub discount_percent: f64,
    pub discount_amount: f64,
    pub tax_rate_id: Option<i64>,
    pub tax_amount: f64,
    pub subtotal: f64,
    pub total: f64,
    pub quantity_delivered: f64,
    pub quantity_invoiced: f64,
    pub quantity_received: f64,
    pub parent_detail_id: Option<i64>,
    pub sales_invoice_id: Option<i64>,
    pub purchase_invoice_id: Option<i64>,
    pub amount: f64,
}

#[derive(Debug, Clone)]
pub struct ProductInfo {
    pub id: i64,
    pub product_code: String,
    pub name: String,
    pub base_uom_id: i64,
    pub selling_price: f64,
    pub cost_price: f64,
    pub category_id: Option<i64>,
}

#[derive(Debug, Clone)]
pub struct AccountMapping {
    pub inventory_account_id: i64,
    pub sales_account_id: i64,
    pub cogs_account_id: i64,
}
