use std::sync::Arc;

use async_trait::async_trait;
use chrono::Days;
use serde_json::{Value, json};

use super::transactions_dto::{
    ApproveTransactionDto, CreateTransactionDto, CreateTransactionLineDto, DocumentType,
    HeaderSnapshot, LineSnapshot, ListTransactionsQuery, PreparedHeader, PreparedLine,
    TransactionResponse,
};
use super::transactions_interfaces::{ITransactionRepo, ITransactionUsecase};
use crate::app::modules::audit_log::{AuditLogChange, CreateAuditDto, IAuditLogUsecase};
use crate::pkg::constans::constants::{DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE};
use crate::pkg::response::response_error::AppError;
use crate::pkg::response::response_success::PaginationMeta;

pub struct TransactionUsecase {
    repo: Arc<dyn ITransactionRepo>,
    audit: Arc<dyn IAuditLogUsecase>,
}

impl TransactionUsecase {
    pub fn new(repo: Arc<dyn ITransactionRepo>, audit: Arc<dyn IAuditLogUsecase>) -> Self {
        Self { repo, audit }
    }

    async fn base_header(
        &self,
        doc_type: DocumentType,
        dto: &CreateTransactionDto,
    ) -> Result<PreparedHeader, AppError> {
        let document_number = match dto
            .document_number
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
        {
            Some(value) => value.to_string(),
            None => self
                .repo
                .next_number(doc_type, dto.document_date)
                .await
                .map_err(AppError::Database)?,
        };

        Ok(PreparedHeader {
            document_number: document_number.clone(),
            transaction_number: document_number,
            document_date: dto.document_date,
            due_date: dto.due_date,
            valid_until: dto.valid_until,
            expected_date: dto.expected_date,
            delivery_date: dto.delivery_date,
            customer_id: dto.customer_id,
            supplier_id: dto.supplier_id,
            warehouse_id: dto.warehouse_id,
            quotation_id: dto.quotation_id,
            sales_order_id: dto.sales_order_id,
            delivery_id: dto.delivery_id,
            purchase_order_id: dto.purchase_order_id,
            goods_receipt_id: dto.goods_receipt_id,
            payment_term_id: dto.payment_term_id,
            tax_rate_id: dto.tax_rate_id,
            salesperson_id: dto.salesperson_id,
            prepared_by: dto.prepared_by,
            bank_account_id: dto.bank_account_id,
            payment_method: dto.payment_method.clone(),
            reference_number: dto.reference_number.clone(),
            shipping_address: dto.shipping_address.clone(),
            notes: dto.notes.clone(),
            currency_code: "IDR".to_string(),
            exchange_rate: 1.0,
            subtotal: 0.0,
            discount_total: 0.0,
            tax_total: 0.0,
            shipping_cost: 0.0,
            grand_total: 0.0,
            total_amount: 0.0,
            allocated_amount: 0.0,
            unallocated_amount: 0.0,
            status: dto.status.clone().unwrap_or_else(|| {
                if doc_type.is_auto_posted() {
                    "completed".to_string()
                } else {
                    "draft".to_string()
                }
            }),
        })
    }

    fn apply_totals(&self, header: &mut PreparedHeader, lines: &[PreparedLine]) {
        header.subtotal = round2(lines.iter().map(|line| line.subtotal).sum());
        header.discount_total = round2(lines.iter().map(|line| line.discount_amount).sum());
        header.tax_total = round2(lines.iter().map(|line| line.tax_amount).sum());
        header.grand_total = round2(header.subtotal + header.tax_total + header.shipping_cost);
        header.total_amount = header.grand_total;
        header.allocated_amount = header.grand_total;
        header.unallocated_amount = 0.0;
    }

    async fn resolve_tax(&self, tax_rate_id: Option<i64>) -> Result<f64, AppError> {
        match tax_rate_id {
            Some(id) => self.repo.tax_rate(id).await.map_err(AppError::Database),
            None => Ok(0.0),
        }
    }

    async fn prepare_standard_lines(
        &self,
        dto_lines: &[CreateTransactionLineDto],
        header_tax_rate_id: Option<i64>,
        purchase: bool,
    ) -> Result<Vec<PreparedLine>, AppError> {
        if dto_lines.is_empty() {
            return Err(AppError::BadRequest(
                "At least one transaction line is required".to_string(),
            ));
        }

        let mut lines = Vec::with_capacity(dto_lines.len());

        for dto in dto_lines {
            let product_id = dto.product_id.ok_or_else(|| {
                AppError::BadRequest("productId is required on every line".into())
            })?;
            let product = self
                .repo
                .product_info(product_id)
                .await
                .map_err(AppError::Database)?;

            let quantity = dto.quantity.unwrap_or(0.0);
            if quantity <= 0.0 {
                return Err(AppError::BadRequest(
                    "Line quantity must be greater than zero".to_string(),
                ));
            }

            let unit_price = dto.unit_price.unwrap_or(if purchase {
                product.cost_price
            } else {
                product.selling_price
            });
            if unit_price < 0.0 {
                return Err(AppError::BadRequest(
                    "Line unit price cannot be negative".to_string(),
                ));
            }

            let discount_percent = dto.discount_percent.unwrap_or(0.0);
            if !(0.0..=100.0).contains(&discount_percent) {
                return Err(AppError::BadRequest(
                    "Line discount percent must be between 0 and 100".to_string(),
                ));
            }

            let tax_rate_id = dto.tax_rate_id.or(header_tax_rate_id);
            let tax_rate = self.resolve_tax(tax_rate_id).await?;
            let (discount_amount, subtotal, tax_amount, total) =
                calculate_line(quantity, unit_price, discount_percent, tax_rate);

            let inventory_account_id = if purchase {
                let mapping = self
                    .repo
                    .account_mapping(product.id)
                    .await
                    .map_err(AppError::Database)?;
                Some(mapping.inventory_account_id)
            } else {
                None
            };

            // Purchase stock is valued at the net purchase price, matching the
            // inventory debit posted to the journal. Sales stock is relieved at
            // the product's standard cost.
            let unit_cost = if purchase {
                subtotal / quantity
            } else {
                dto.unit_cost.unwrap_or(product.cost_price)
            };

            lines.push(PreparedLine {
                product_id: Some(product.id),
                description: dto.description.clone().or(Some(product.name)),
                quantity,
                uom_id: dto.uom_id.or(Some(product.base_uom_id)),
                unit_price,
                unit_cost,
                discount_percent,
                discount_amount,
                tax_rate_id,
                tax_amount,
                subtotal,
                total,
                inventory_account_id,
                ..Default::default()
            });
        }

        Ok(lines)
    }

    async fn sales_order_line_from_quotation(
        &self,
        quotation_line: &LineSnapshot,
    ) -> Result<PreparedLine, AppError> {
        let product_id = quotation_line
            .product_id
            .ok_or_else(|| AppError::BadRequest("Quotation line has no product".to_string()))?;
        let product = self
            .repo
            .product_info(product_id)
            .await
            .map_err(AppError::Database)?;
        let mapping = self
            .repo
            .account_mapping(product_id)
            .await
            .map_err(AppError::Database)?;
        let tax_rate = self.resolve_tax(quotation_line.tax_rate_id).await?;
        let (discount_amount, subtotal, tax_amount, total) = calculate_line(
            quotation_line.quantity,
            quotation_line.unit_price,
            quotation_line.discount_percent,
            tax_rate,
        );

        Ok(PreparedLine {
            product_id: Some(product_id),
            description: quotation_line.description.clone().or(Some(product.name)),
            quantity: quotation_line.quantity,
            uom_id: quotation_line.uom_id.or(Some(product.base_uom_id)),
            unit_price: quotation_line.unit_price,
            unit_cost: if product.cost_price > 0.0 {
                product.cost_price
            } else {
                quotation_line.unit_cost
            },
            discount_percent: quotation_line.discount_percent,
            discount_amount,
            tax_rate_id: quotation_line.tax_rate_id,
            tax_amount,
            subtotal,
            total,
            revenue_account_id: Some(mapping.sales_account_id),
            inventory_account_id: Some(mapping.inventory_account_id),
            cogs_account_id: Some(mapping.cogs_account_id),
            ..Default::default()
        })
    }

    async fn delivery_line_from_so(
        &self,
        so_line: &LineSnapshot,
        quantity: f64,
    ) -> Result<PreparedLine, AppError> {
        let product_id = so_line
            .product_id
            .ok_or_else(|| AppError::BadRequest("Sales order line has no product".to_string()))?;
        let product = self
            .repo
            .product_info(product_id)
            .await
            .map_err(AppError::Database)?;
        let mapping = self
            .repo
            .account_mapping(product_id)
            .await
            .map_err(AppError::Database)?;
        let tax_rate = self.resolve_tax(so_line.tax_rate_id).await?;
        let (discount_amount, subtotal, tax_amount, total) = calculate_line(
            quantity,
            so_line.unit_price,
            so_line.discount_percent,
            tax_rate,
        );

        Ok(PreparedLine {
            product_id: Some(product_id),
            description: so_line.description.clone().or(Some(product.name)),
            quantity,
            uom_id: so_line.uom_id.or(Some(product.base_uom_id)),
            unit_price: so_line.unit_price,
            unit_cost: if product.cost_price > 0.0 {
                product.cost_price
            } else {
                so_line.unit_price
            },
            discount_percent: so_line.discount_percent,
            discount_amount,
            tax_rate_id: so_line.tax_rate_id,
            tax_amount,
            subtotal,
            total,
            parent_detail_id: Some(so_line.id),
            inventory_account_id: Some(mapping.inventory_account_id),
            cogs_account_id: Some(mapping.cogs_account_id),
            revenue_account_id: Some(mapping.sales_account_id),
            ..Default::default()
        })
    }

    async fn goods_receipt_line_from_po(
        &self,
        po_line: &LineSnapshot,
        quantity: f64,
    ) -> Result<PreparedLine, AppError> {
        let tax_rate = self.resolve_tax(po_line.tax_rate_id).await?;
        let (discount_amount, subtotal, tax_amount, total) = calculate_line(
            quantity,
            po_line.unit_price,
            po_line.discount_percent,
            tax_rate,
        );

        Ok(PreparedLine {
            product_id: po_line.product_id,
            description: po_line.description.clone(),
            quantity,
            uom_id: po_line.uom_id,
            unit_price: po_line.unit_price,
            unit_cost: po_line.unit_price,
            discount_percent: po_line.discount_percent,
            discount_amount,
            tax_rate_id: po_line.tax_rate_id,
            tax_amount,
            subtotal,
            total,
            parent_detail_id: Some(po_line.id),
            ..Default::default()
        })
    }

    async fn prepare_delivery_lines(
        &self,
        sales_order_id: i64,
        dto_lines: &[CreateTransactionLineDto],
    ) -> Result<(HeaderSnapshot, Vec<PreparedLine>), AppError> {
        let sales_order = self
            .repo
            .get_header(DocumentType::SalesOrder, sales_order_id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Sales order not found".to_string()))?;

        if sales_order.status != "approved" {
            return Err(AppError::BadRequest(
                "Sales order must be approved before creating a delivery".to_string(),
            ));
        }

        let so_lines = self
            .repo
            .get_lines(DocumentType::SalesOrder, sales_order_id)
            .await
            .map_err(AppError::Database)?;

        let mut lines = Vec::new();

        if dto_lines.is_empty() {
            for so_line in &so_lines {
                let remaining = so_line.quantity - so_line.quantity_delivered;
                if remaining > 0.0 {
                    lines.push(self.delivery_line_from_so(so_line, remaining).await?);
                }
            }
        } else {
            for dto in dto_lines {
                let parent_id = dto.parent_detail_id.ok_or_else(|| {
                    AppError::BadRequest(
                        "parentDetailId is required when sending explicit delivery lines"
                            .to_string(),
                    )
                })?;
                let so_line = so_lines
                    .iter()
                    .find(|line| line.id == parent_id)
                    .ok_or_else(|| {
                        AppError::BadRequest(format!(
                            "Sales order line {parent_id} does not belong to this sales order"
                        ))
                    })?;
                let remaining = so_line.quantity - so_line.quantity_delivered;
                let quantity = dto.quantity.unwrap_or(remaining);
                if quantity <= 0.0 || quantity > remaining + 0.0001 {
                    return Err(AppError::BadRequest(format!(
                        "Delivery quantity for sales order line {parent_id} exceeds the remaining quantity"
                    )));
                }
                lines.push(self.delivery_line_from_so(so_line, quantity).await?);
            }
        }

        if lines.is_empty() {
            return Err(AppError::BadRequest(
                "Sales order has no remaining quantity to deliver".to_string(),
            ));
        }

        Ok((sales_order, lines))
    }

    async fn prepare_goods_receipt_lines(
        &self,
        purchase_order_id: i64,
        dto_lines: &[CreateTransactionLineDto],
    ) -> Result<(HeaderSnapshot, Vec<PreparedLine>), AppError> {
        let purchase_order = self
            .repo
            .get_header(DocumentType::PurchaseOrder, purchase_order_id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Purchase order not found".to_string()))?;

        if purchase_order.status != "approved" {
            return Err(AppError::BadRequest(
                "Purchase order must be approved before creating a goods receipt".to_string(),
            ));
        }

        let po_lines = self
            .repo
            .get_lines(DocumentType::PurchaseOrder, purchase_order_id)
            .await
            .map_err(AppError::Database)?;

        let mut lines = Vec::new();

        if dto_lines.is_empty() {
            for po_line in &po_lines {
                let remaining = po_line.quantity - po_line.quantity_received;
                if remaining > 0.0 {
                    lines.push(self.goods_receipt_line_from_po(po_line, remaining).await?);
                }
            }
        } else {
            for dto in dto_lines {
                let parent_id = dto.parent_detail_id.ok_or_else(|| {
                    AppError::BadRequest(
                        "parentDetailId is required when sending explicit receipt lines"
                            .to_string(),
                    )
                })?;
                let po_line = po_lines
                    .iter()
                    .find(|line| line.id == parent_id)
                    .ok_or_else(|| {
                        AppError::BadRequest(format!(
                            "Purchase order line {parent_id} does not belong to this purchase order"
                        ))
                    })?;
                let remaining = po_line.quantity - po_line.quantity_received;
                let quantity = dto.quantity.unwrap_or(remaining);
                if quantity <= 0.0 || quantity > remaining + 0.0001 {
                    return Err(AppError::BadRequest(format!(
                        "Receipt quantity for purchase order line {parent_id} exceeds the remaining quantity"
                    )));
                }
                lines.push(self.goods_receipt_line_from_po(po_line, quantity).await?);
            }
        }

        if lines.is_empty() {
            return Err(AppError::BadRequest(
                "Purchase order has no remaining quantity to receive".to_string(),
            ));
        }

        Ok((purchase_order, lines))
    }

    async fn prepare_sales_invoice_lines(
        &self,
        delivery_id: i64,
    ) -> Result<(HeaderSnapshot, HeaderSnapshot, Vec<PreparedLine>), AppError> {
        let delivery = self
            .repo
            .get_header(DocumentType::Delivery, delivery_id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Delivery not found".to_string()))?;

        if delivery.status != "completed" && delivery.status != "approved" {
            return Err(AppError::BadRequest(
                "Delivery must be completed before creating a sales invoice".to_string(),
            ));
        }

        let sales_order_id = delivery
            .sales_order_id
            .ok_or_else(|| AppError::BadRequest("Delivery has no sales order reference".into()))?;

        let sales_order = self
            .repo
            .get_header(DocumentType::SalesOrder, sales_order_id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Sales order not found".to_string()))?;

        let so_lines = self
            .repo
            .get_lines(DocumentType::SalesOrder, sales_order_id)
            .await
            .map_err(AppError::Database)?;

        let delivery_lines = self
            .repo
            .get_lines(DocumentType::Delivery, delivery_id)
            .await
            .map_err(AppError::Database)?;

        let mut lines = Vec::new();

        for delivery_line in delivery_lines {
            let parent_id = delivery_line.parent_detail_id.ok_or_else(|| {
                AppError::BadRequest("Delivery line has no sales order line reference".to_string())
            })?;
            let so_line = so_lines
                .iter()
                .find(|line| line.id == parent_id)
                .ok_or_else(|| {
                    AppError::BadRequest(format!(
                        "Sales order line {parent_id} referenced by delivery was not found"
                    ))
                })?;

            let already_invoiced = self
                .repo
                .invoiced_quantity(DocumentType::SalesInvoice, delivery_line.id)
                .await
                .map_err(AppError::Database)?;
            let ticket_remaining = delivery_line.quantity - already_invoiced;
            let order_remaining = so_line.quantity - so_line.quantity_invoiced;
            let quantity = ticket_remaining.min(order_remaining);
            if quantity <= 0.0 {
                continue;
            }

            let product_id = delivery_line
                .product_id
                .or(so_line.product_id)
                .ok_or_else(|| AppError::BadRequest("Invoice line has no product".to_string()))?;
            let product = self
                .repo
                .product_info(product_id)
                .await
                .map_err(AppError::Database)?;
            let mapping = self
                .repo
                .account_mapping(product_id)
                .await
                .map_err(AppError::Database)?;
            let tax_rate = self.resolve_tax(so_line.tax_rate_id).await?;
            let (discount_amount, subtotal, tax_amount, total) = calculate_line(
                quantity,
                so_line.unit_price,
                so_line.discount_percent,
                tax_rate,
            );

            lines.push(PreparedLine {
                product_id: Some(product_id),
                description: delivery_line
                    .description
                    .clone()
                    .or(so_line.description.clone())
                    .or(Some(product.name)),
                quantity,
                uom_id: delivery_line.uom_id.or(so_line.uom_id),
                unit_price: so_line.unit_price,
                unit_cost: so_line.unit_cost,
                discount_percent: so_line.discount_percent,
                discount_amount,
                tax_rate_id: so_line.tax_rate_id,
                tax_amount,
                subtotal,
                total,
                parent_detail_id: Some(so_line.id),
                reference_detail_id: Some(delivery_line.id),
                revenue_account_id: Some(mapping.sales_account_id),
                ..Default::default()
            });
        }

        if lines.is_empty() {
            return Err(AppError::BadRequest(
                "All delivered lines have already been invoiced".to_string(),
            ));
        }

        Ok((delivery, sales_order, lines))
    }

    async fn prepare_purchase_invoice_lines(
        &self,
        goods_receipt_id: i64,
    ) -> Result<(HeaderSnapshot, HeaderSnapshot, Vec<PreparedLine>), AppError> {
        let goods_receipt = self
            .repo
            .get_header(DocumentType::GoodsReceipt, goods_receipt_id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Goods receipt not found".to_string()))?;

        if goods_receipt.status != "completed" && goods_receipt.status != "approved" {
            return Err(AppError::BadRequest(
                "Goods receipt must be completed before creating a purchase invoice".to_string(),
            ));
        }

        let purchase_order_id = goods_receipt.purchase_order_id.ok_or_else(|| {
            AppError::BadRequest("Goods receipt has no purchase order reference".into())
        })?;

        let purchase_order = self
            .repo
            .get_header(DocumentType::PurchaseOrder, purchase_order_id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound("Purchase order not found".to_string()))?;

        let po_lines = self
            .repo
            .get_lines(DocumentType::PurchaseOrder, purchase_order_id)
            .await
            .map_err(AppError::Database)?;

        let gr_lines = self
            .repo
            .get_lines(DocumentType::GoodsReceipt, goods_receipt_id)
            .await
            .map_err(AppError::Database)?;

        let mut lines = Vec::new();

        for gr_line in gr_lines {
            let parent_id = gr_line.parent_detail_id.ok_or_else(|| {
                AppError::BadRequest(
                    "Goods receipt line has no purchase order line reference".to_string(),
                )
            })?;
            let po_line = po_lines
                .iter()
                .find(|line| line.id == parent_id)
                .ok_or_else(|| {
                    AppError::BadRequest(format!(
                        "Purchase order line {parent_id} referenced by goods receipt was not found"
                    ))
                })?;

            let already_invoiced = self
                .repo
                .invoiced_quantity(DocumentType::PurchaseInvoice, gr_line.id)
                .await
                .map_err(AppError::Database)?;
            let ticket_remaining = gr_line.quantity - already_invoiced;
            let order_remaining = po_line.quantity - po_line.quantity_invoiced;
            let quantity = ticket_remaining.min(order_remaining);
            if quantity <= 0.0 {
                continue;
            }

            let product_id = gr_line.product_id.or(po_line.product_id).ok_or_else(|| {
                AppError::BadRequest("Purchase invoice line has no product".to_string())
            })?;
            let product = self
                .repo
                .product_info(product_id)
                .await
                .map_err(AppError::Database)?;
            let mapping = self
                .repo
                .account_mapping(product_id)
                .await
                .map_err(AppError::Database)?;
            let tax_rate = self.resolve_tax(po_line.tax_rate_id).await?;
            let (discount_amount, subtotal, tax_amount, total) = calculate_line(
                quantity,
                po_line.unit_price,
                po_line.discount_percent,
                tax_rate,
            );

            lines.push(PreparedLine {
                product_id: Some(product_id),
                description: gr_line
                    .description
                    .clone()
                    .or(po_line.description.clone())
                    .or(Some(product.name)),
                quantity,
                uom_id: gr_line.uom_id.or(po_line.uom_id),
                unit_price: po_line.unit_price,
                unit_cost: po_line.unit_cost,
                discount_percent: po_line.discount_percent,
                discount_amount,
                tax_rate_id: po_line.tax_rate_id,
                tax_amount,
                subtotal,
                total,
                parent_detail_id: Some(po_line.id),
                reference_detail_id: Some(gr_line.id),
                expense_account_id: Some(mapping.inventory_account_id),
                ..Default::default()
            });
        }

        if lines.is_empty() {
            return Err(AppError::BadRequest(
                "All received lines have already been invoiced".to_string(),
            ));
        }

        Ok((goods_receipt, purchase_order, lines))
    }

    async fn prepare_customer_receipt_lines(
        &self,
        dto_lines: &[CreateTransactionLineDto],
    ) -> Result<(i64, Vec<PreparedLine>, f64), AppError> {
        if dto_lines.is_empty() {
            return Err(AppError::BadRequest(
                "At least one sales invoice must be selected for the receipt".to_string(),
            ));
        }

        let mut customer_id: Option<i64> = None;
        let mut total_amount = 0.0;
        let mut lines = Vec::new();

        for dto in dto_lines {
            let invoice_id = dto.sales_invoice_id.ok_or_else(|| {
                AppError::BadRequest("salesInvoiceId is required on receipt lines".to_string())
            })?;
            let invoice = self
                .repo
                .get_header(DocumentType::SalesInvoice, invoice_id)
                .await
                .map_err(AppError::Database)?
                .ok_or_else(|| {
                    AppError::NotFound(format!("Sales invoice {invoice_id} not found"))
                })?;

            if invoice.status != "completed" && invoice.status != "approved" {
                return Err(AppError::BadRequest(format!(
                    "Sales invoice {invoice_id} is not ready for payment"
                )));
            }

            if let Some(existing) = customer_id {
                if invoice.customer_id != Some(existing) {
                    return Err(AppError::BadRequest(
                        "All invoices in one receipt must belong to the same customer".to_string(),
                    ));
                }
            } else {
                customer_id = invoice.customer_id;
            }

            let amount = dto.amount.unwrap_or(invoice.outstanding_amount);
            if amount <= 0.0 || amount > invoice.outstanding_amount + 0.0001 {
                return Err(AppError::BadRequest(format!(
                    "Receipt amount for sales invoice {invoice_id} exceeds its outstanding amount"
                )));
            }

            total_amount += amount;
            lines.push(PreparedLine {
                sales_invoice_id: Some(invoice_id),
                amount,
                description: dto.description.clone(),
                ..Default::default()
            });
        }

        let customer_id = customer_id.ok_or_else(|| {
            AppError::BadRequest("Unable to determine customer for receipt".into())
        })?;

        Ok((customer_id, lines, round2(total_amount)))
    }

    async fn prepare_vendor_payment_lines(
        &self,
        dto_lines: &[CreateTransactionLineDto],
    ) -> Result<(i64, Vec<PreparedLine>, f64), AppError> {
        if dto_lines.is_empty() {
            return Err(AppError::BadRequest(
                "At least one purchase invoice must be selected for the payment".to_string(),
            ));
        }

        let mut supplier_id: Option<i64> = None;
        let mut total_amount = 0.0;
        let mut lines = Vec::new();

        for dto in dto_lines {
            let invoice_id = dto.purchase_invoice_id.ok_or_else(|| {
                AppError::BadRequest("purchaseInvoiceId is required on payment lines".to_string())
            })?;
            let invoice = self
                .repo
                .get_header(DocumentType::PurchaseInvoice, invoice_id)
                .await
                .map_err(AppError::Database)?
                .ok_or_else(|| {
                    AppError::NotFound(format!("Purchase invoice {invoice_id} not found"))
                })?;

            if invoice.status != "completed" && invoice.status != "approved" {
                return Err(AppError::BadRequest(format!(
                    "Purchase invoice {invoice_id} is not ready for payment"
                )));
            }

            if let Some(existing) = supplier_id {
                if invoice.supplier_id != Some(existing) {
                    return Err(AppError::BadRequest(
                        "All invoices in one payment must belong to the same supplier".to_string(),
                    ));
                }
            } else {
                supplier_id = invoice.supplier_id;
            }

            let amount = dto.amount.unwrap_or(invoice.outstanding_amount);
            if amount <= 0.0 || amount > invoice.outstanding_amount + 0.0001 {
                return Err(AppError::BadRequest(format!(
                    "Payment amount for purchase invoice {invoice_id} exceeds its outstanding amount"
                )));
            }

            total_amount += amount;
            lines.push(PreparedLine {
                purchase_invoice_id: Some(invoice_id),
                amount,
                description: dto.description.clone(),
                ..Default::default()
            });
        }

        let supplier_id = supplier_id.ok_or_else(|| {
            AppError::BadRequest("Unable to determine supplier for payment".into())
        })?;

        Ok((supplier_id, lines, round2(total_amount)))
    }

    async fn parent_document_number(
        &self,
        doc_type: DocumentType,
        id: Option<i64>,
    ) -> Option<String> {
        let id = id?;
        self.repo
            .get_header(doc_type, id)
            .await
            .ok()
            .flatten()
            .map(|header| header.document_number)
    }

    async fn audit_reference(
        &self,
        doc_type: DocumentType,
        id: i64,
        header: &PreparedHeader,
    ) -> String {
        let mut parts: Vec<String> = Vec::new();

        match doc_type {
            DocumentType::SalesOrder => {
                if let Some(number) = self
                    .parent_document_number(DocumentType::Quotation, header.quotation_id)
                    .await
                {
                    parts.push(format!("Sales Quotation {number}"));
                }
            }
            DocumentType::Delivery => {
                if let Some(number) = self
                    .parent_document_number(DocumentType::SalesOrder, header.sales_order_id)
                    .await
                {
                    parts.push(format!("Sales Order {number}"));
                }
            }
            DocumentType::SalesInvoice => {
                if let Some(number) = self
                    .parent_document_number(DocumentType::SalesOrder, header.sales_order_id)
                    .await
                {
                    parts.push(format!("Sales Order {number}"));
                }
                if let Some(number) = self
                    .parent_document_number(DocumentType::Delivery, header.delivery_id)
                    .await
                {
                    parts.push(format!("Delivery {number}"));
                }
            }
            DocumentType::CustomerReceipt => {
                let lines = self
                    .repo
                    .get_lines(DocumentType::CustomerReceipt, id)
                    .await
                    .unwrap_or_default();
                let invoice_id = lines.first().and_then(|line| line.sales_invoice_id);
                if let Some(number) = self
                    .parent_document_number(DocumentType::SalesInvoice, invoice_id)
                    .await
                {
                    parts.push(format!("Sales Invoice {number}"));
                }
            }
            DocumentType::GoodsReceipt => {
                if let Some(number) = self
                    .parent_document_number(DocumentType::PurchaseOrder, header.purchase_order_id)
                    .await
                {
                    parts.push(format!("Purchase Order {number}"));
                }
            }
            DocumentType::PurchaseInvoice => {
                if let Some(number) = self
                    .parent_document_number(DocumentType::PurchaseOrder, header.purchase_order_id)
                    .await
                {
                    parts.push(format!("Purchase Order {number}"));
                }
                if let Some(number) = self
                    .parent_document_number(DocumentType::GoodsReceipt, header.goods_receipt_id)
                    .await
                {
                    parts.push(format!("Goods Receipt {number}"));
                }
            }
            DocumentType::VendorPayment => {
                let lines = self
                    .repo
                    .get_lines(DocumentType::VendorPayment, id)
                    .await
                    .unwrap_or_default();
                let invoice_id = lines.first().and_then(|line| line.purchase_invoice_id);
                if let Some(number) = self
                    .parent_document_number(DocumentType::PurchaseInvoice, invoice_id)
                    .await
                {
                    parts.push(format!("Purchase Invoice {number}"));
                }
            }
            DocumentType::Quotation | DocumentType::PurchaseOrder => {}
        }

        if parts.is_empty() {
            String::new()
        } else {
            format!(" ({})", parts.join(" / "))
        }
    }

    async fn write_audit(
        &self,
        doc_type: DocumentType,
        id: i64,
        header: &PreparedHeader,
        action: &str,
        dto: &CreateTransactionDto,
    ) {
        let actor = dto
            .actor
            .clone()
            .or_else(|| dto.prepared_by.map(|id| id.to_string()))
            .unwrap_or_else(|| "system".to_string());

        let reference = self.audit_reference(doc_type, id, header).await;
        let label = doc_type.label();
        let amount = if header.total_amount > 0.0 {
            header.total_amount
        } else {
            header.grand_total
        };
        let amount_text = format!("IDR {amount:.2}");

        let summary = match action {
            "create" => match doc_type {
                DocumentType::CustomerReceipt => {
                    format!("Recorded customer payment {}", header.document_number)
                }
                DocumentType::VendorPayment => {
                    format!("Recorded vendor payment {}", header.document_number)
                }
                _ => format!("Created {label} {}", header.document_number),
            },
            "approve" => format!("Approved {label} {}", header.document_number),
            "post" => format!("Posted {label} {}", header.document_number),
            _ => format!("{action} {label} {}", header.document_number),
        };

        let base_description = match action {
            "create" => match doc_type {
                DocumentType::CustomerReceipt => format!(
                    "Customer payment {} recorded for {amount_text}{reference}.",
                    header.document_number
                ),
                DocumentType::VendorPayment => format!(
                    "Vendor payment {} recorded for {amount_text}{reference}.",
                    header.document_number
                ),
                DocumentType::Delivery => format!(
                    "Created Delivery Ticket {} for {amount_text}{reference}.",
                    header.document_number
                ),
                DocumentType::GoodsReceipt => format!(
                    "Created Goods Receipt Ticket {} for {amount_text}{reference}.",
                    header.document_number
                ),
                DocumentType::SalesInvoice => format!(
                    "Created Sales Invoice {} for {amount_text}{reference}.",
                    header.document_number
                ),
                DocumentType::PurchaseInvoice => format!(
                    "Created Purchase Invoice {} for {amount_text}{reference}.",
                    header.document_number
                ),
                _ => format!(
                    "Created {label} {} for {amount_text}{reference}.",
                    header.document_number
                ),
            },
            "approve" => format!(
                "Approved {label} {} with total {amount_text}{reference}.",
                header.document_number
            ),
            "post" => format!(
                "{label} {} posted automatically on creation; no separate approval step is required.",
                header.document_number
            ),
            _ => format!("{action} {label} {}.", header.document_number),
        };

        let note_suffix = dto
            .notes
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(|value| format!(" Notes: {value}"))
            .unwrap_or_default();
        let description = if action == "create" {
            format!("{base_description}{note_suffix}")
        } else {
            base_description
        };

        let mut changes = Vec::new();
        match action {
            "create" => {
                changes.push(AuditLogChange {
                    field: "document_number".to_string(),
                    before: None,
                    after: Some(json!(header.document_number)),
                });
                changes.push(AuditLogChange {
                    field: "status".to_string(),
                    before: None,
                    after: Some(json!(header.status)),
                });
                if amount > 0.0 {
                    changes.push(AuditLogChange {
                        field: "total".to_string(),
                        before: None,
                        after: Some(json!(amount)),
                    });
                }
                if let Some(prepared_by) = header.prepared_by {
                    changes.push(AuditLogChange {
                        field: "prepared_by".to_string(),
                        before: None,
                        after: Some(json!(prepared_by)),
                    });
                }
            }
            "approve" => {
                changes.push(AuditLogChange {
                    field: "status".to_string(),
                    before: Some(json!("draft")),
                    after: Some(json!("approved")),
                });
            }
            "post" => {
                changes.push(AuditLogChange {
                    field: "posting".to_string(),
                    before: None,
                    after: Some(json!("posted")),
                });
            }
            _ => {}
        }

        let result = self
            .audit
            .create(CreateAuditDto {
                module: "transactions".to_string(),
                entity_type: doc_type.as_str().to_string(),
                entity_id: id.to_string(),
                document_number: header.document_number.clone(),
                action: action.to_string(),
                status: header.status.clone(),
                actor,
                summary,
                description,
                changes,
            })
            .await;

        if let Err(error) = result {
            tracing::warn!(?error, "failed to write transaction audit log");
        }
    }
}

#[async_trait]
impl ITransactionUsecase for TransactionUsecase {
    async fn list(
        &self,
        doc_type: DocumentType,
        query: ListTransactionsQuery,
    ) -> Result<(Vec<Value>, PaginationMeta), AppError> {
        let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
        let limit = query
            .limit
            .unwrap_or(DEFAULT_PAGE_SIZE)
            .clamp(1, MAX_PAGE_SIZE);
        let normalized = ListTransactionsQuery {
            page: Some(page),
            limit: Some(limit),
            ..query
        };

        let (items, total) = self
            .repo
            .list(doc_type, &normalized)
            .await
            .map_err(AppError::Database)?;

        Ok((items, PaginationMeta::new(page, limit, total)))
    }

    async fn get(&self, doc_type: DocumentType, id: i64) -> Result<TransactionResponse, AppError> {
        self.repo
            .get(doc_type, id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound(format!("{} not found", doc_type.as_str())))
    }

    async fn create(
        &self,
        doc_type: DocumentType,
        dto: CreateTransactionDto,
    ) -> Result<TransactionResponse, AppError> {
        let mut header = self.base_header(doc_type, &dto).await?;

        let id = match doc_type {
            DocumentType::Quotation => {
                if dto.customer_id.is_none() {
                    return Err(AppError::BadRequest("customerId is required".to_string()));
                }
                let lines = self
                    .prepare_standard_lines(&dto.lines, dto.tax_rate_id, false)
                    .await?;
                self.apply_totals(&mut header, &lines);
                header.customer_id = dto.customer_id;
                header.payment_term_id = dto.payment_term_id;
                header.tax_rate_id = dto.tax_rate_id;
                header.salesperson_id = dto.salesperson_id;
                header.valid_until = dto.valid_until;
                self.repo
                    .create_quotation(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
            DocumentType::SalesOrder => {
                let quotation_id = dto
                    .quotation_id
                    .ok_or_else(|| AppError::BadRequest("quotationId is required".to_string()))?;
                let quotation = self
                    .repo
                    .get_header(DocumentType::Quotation, quotation_id)
                    .await
                    .map_err(AppError::Database)?
                    .ok_or_else(|| AppError::NotFound("Quotation not found".to_string()))?;

                if quotation.status != "approved" {
                    return Err(AppError::BadRequest(
                        "Quotation must be approved before creating a sales order".to_string(),
                    ));
                }

                let quotation_lines = self
                    .repo
                    .get_lines(DocumentType::Quotation, quotation_id)
                    .await
                    .map_err(AppError::Database)?;
                if quotation_lines.is_empty() {
                    return Err(AppError::BadRequest(
                        "The selected quotation has no lines".to_string(),
                    ));
                }
                let mut lines = Vec::with_capacity(quotation_lines.len());
                for quotation_line in &quotation_lines {
                    lines.push(self.sales_order_line_from_quotation(quotation_line).await?);
                }
                self.apply_totals(&mut header, &lines);
                header.customer_id = quotation.customer_id;
                header.quotation_id = Some(quotation_id);
                header.warehouse_id = Some(dto.warehouse_id.unwrap_or(1));
                header.payment_term_id = quotation.payment_term_id;
                header.tax_rate_id = quotation.tax_rate_id;
                header.salesperson_id = quotation.salesperson_id;
                header.delivery_date = dto.delivery_date;
                self.repo
                    .create_sales_order(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
            DocumentType::Delivery => {
                let sales_order_id = dto
                    .sales_order_id
                    .ok_or_else(|| AppError::BadRequest("salesOrderId is required".to_string()))?;
                let (sales_order, lines) = self
                    .prepare_delivery_lines(sales_order_id, &dto.lines)
                    .await?;
                self.apply_totals(&mut header, &lines);
                header.customer_id = sales_order.customer_id;
                header.sales_order_id = Some(sales_order_id);
                header.warehouse_id = Some(dto.warehouse_id.unwrap_or(1));
                header.payment_term_id = sales_order.payment_term_id;
                header.tax_rate_id = sales_order.tax_rate_id;
                header.status = "completed".to_string();
                self.repo
                    .create_delivery(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
            DocumentType::SalesInvoice => {
                let delivery_id = dto
                    .delivery_id
                    .ok_or_else(|| AppError::BadRequest("deliveryId is required".to_string()))?;
                let (delivery, sales_order, lines) =
                    self.prepare_sales_invoice_lines(delivery_id).await?;
                self.apply_totals(&mut header, &lines);
                header.customer_id = delivery.customer_id;
                header.sales_order_id = delivery.sales_order_id;
                header.delivery_id = Some(delivery_id);
                header.payment_term_id = sales_order.payment_term_id;
                header.tax_rate_id = sales_order.tax_rate_id;
                header.due_date = Some(dto.due_date.unwrap_or(dto.document_date + Days::new(30)));
                header.status = "completed".to_string();
                self.repo
                    .create_sales_invoice(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
            DocumentType::CustomerReceipt => {
                let (customer_id, lines, total) =
                    self.prepare_customer_receipt_lines(&dto.lines).await?;
                header.customer_id = Some(customer_id);
                header.total_amount = total;
                header.allocated_amount = total;
                header.unallocated_amount = 0.0;
                header.payment_method = Some(
                    dto.payment_method
                        .clone()
                        .unwrap_or_else(|| "transfer".to_string()),
                );
                header.bank_account_id = dto.bank_account_id.or(Some(1));
                header.status = "completed".to_string();
                self.repo
                    .create_customer_receipt(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
            DocumentType::PurchaseOrder => {
                if dto.supplier_id.is_none() {
                    return Err(AppError::BadRequest("supplierId is required".to_string()));
                }
                let lines = self
                    .prepare_standard_lines(&dto.lines, dto.tax_rate_id, true)
                    .await?;
                self.apply_totals(&mut header, &lines);
                header.supplier_id = dto.supplier_id;
                header.warehouse_id = Some(dto.warehouse_id.unwrap_or(1));
                header.payment_term_id = dto.payment_term_id;
                header.tax_rate_id = dto.tax_rate_id;
                header.expected_date = dto.expected_date;
                self.repo
                    .create_purchase_order(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
            DocumentType::GoodsReceipt => {
                let purchase_order_id = dto.purchase_order_id.ok_or_else(|| {
                    AppError::BadRequest("purchaseOrderId is required".to_string())
                })?;
                let (purchase_order, lines) = self
                    .prepare_goods_receipt_lines(purchase_order_id, &dto.lines)
                    .await?;
                self.apply_totals(&mut header, &lines);
                header.supplier_id = purchase_order.supplier_id;
                header.purchase_order_id = Some(purchase_order_id);
                header.warehouse_id = Some(dto.warehouse_id.unwrap_or(1));
                header.payment_term_id = purchase_order.payment_term_id;
                header.tax_rate_id = purchase_order.tax_rate_id;
                header.status = "completed".to_string();
                self.repo
                    .create_goods_receipt(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
            DocumentType::PurchaseInvoice => {
                let goods_receipt_id = dto.goods_receipt_id.ok_or_else(|| {
                    AppError::BadRequest("goodsReceiptId is required".to_string())
                })?;
                let (goods_receipt, purchase_order, lines) = self
                    .prepare_purchase_invoice_lines(goods_receipt_id)
                    .await?;
                self.apply_totals(&mut header, &lines);
                header.supplier_id = goods_receipt.supplier_id;
                header.purchase_order_id = goods_receipt.purchase_order_id;
                header.goods_receipt_id = Some(goods_receipt_id);
                header.payment_term_id = purchase_order.payment_term_id;
                header.tax_rate_id = purchase_order.tax_rate_id;
                header.due_date = Some(dto.due_date.unwrap_or(dto.document_date + Days::new(30)));
                header.status = "completed".to_string();
                self.repo
                    .create_purchase_invoice(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
            DocumentType::VendorPayment => {
                let (supplier_id, lines, total) =
                    self.prepare_vendor_payment_lines(&dto.lines).await?;
                header.supplier_id = Some(supplier_id);
                header.total_amount = total;
                header.allocated_amount = total;
                header.unallocated_amount = 0.0;
                header.payment_method = Some(
                    dto.payment_method
                        .clone()
                        .unwrap_or_else(|| "transfer".to_string()),
                );
                header.bank_account_id = dto.bank_account_id.or(Some(1));
                header.status = "completed".to_string();
                self.repo
                    .create_vendor_payment(&header, &lines)
                    .await
                    .map_err(AppError::Database)?
            }
        };

        self.write_audit(doc_type, id, &header, "create", &dto)
            .await;

        if doc_type.is_auto_posted() {
            self.write_audit(doc_type, id, &header, "post", &dto).await;
        }

        self.repo
            .get(doc_type, id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::Internal(anyhow::anyhow!("created document not found")))
    }

    async fn approve(
        &self,
        doc_type: DocumentType,
        id: i64,
        dto: ApproveTransactionDto,
    ) -> Result<TransactionResponse, AppError> {
        if !doc_type.is_approvable() {
            return Err(AppError::BadRequest(format!(
                "{} does not support approval",
                doc_type.as_str()
            )));
        }

        let mut header = self
            .repo
            .get_header(doc_type, id)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::NotFound(format!("{} not found", doc_type.as_str())))?;

        if header.status == "approved" {
            return self.get(doc_type, id).await;
        }

        self.repo
            .approve(doc_type, id, dto.actor_id)
            .await
            .map_err(AppError::Database)?;
        header.status = "approved".to_string();

        let audit_dto = CreateTransactionDto {
            document_date: header.document_date,
            actor: dto.actor.clone(),
            prepared_by: dto.actor_id,
            notes: Some(format!("Approved {}", doc_type.as_str())),
            ..empty_create_dto(header.document_date)
        };

        let prepared_header = PreparedHeader {
            document_number: header.document_number.clone(),
            transaction_number: header.document_number.clone(),
            document_date: header.document_date,
            due_date: None,
            valid_until: None,
            expected_date: None,
            delivery_date: None,
            customer_id: header.customer_id,
            supplier_id: header.supplier_id,
            warehouse_id: header.warehouse_id,
            quotation_id: header.quotation_id,
            sales_order_id: header.sales_order_id,
            delivery_id: header.delivery_id,
            purchase_order_id: header.purchase_order_id,
            goods_receipt_id: header.goods_receipt_id,
            payment_term_id: header.payment_term_id,
            tax_rate_id: header.tax_rate_id,
            salesperson_id: header.salesperson_id,
            prepared_by: dto.actor_id,
            bank_account_id: None,
            payment_method: None,
            reference_number: None,
            shipping_address: None,
            notes: None,
            currency_code: "IDR".to_string(),
            exchange_rate: 1.0,
            subtotal: 0.0,
            discount_total: 0.0,
            tax_total: 0.0,
            shipping_cost: 0.0,
            grand_total: header.grand_total,
            total_amount: 0.0,
            allocated_amount: 0.0,
            unallocated_amount: 0.0,
            status: "approved".to_string(),
        };

        self.write_audit(doc_type, id, &prepared_header, "approve", &audit_dto)
            .await;

        self.get(doc_type, id).await
    }
}

fn calculate_line(
    quantity: f64,
    unit_price: f64,
    discount_percent: f64,
    tax_rate: f64,
) -> (f64, f64, f64, f64) {
    let gross = quantity * unit_price;
    let discount_amount = round2(gross * discount_percent / 100.0);
    let subtotal = round2(gross - discount_amount);
    let tax_amount = round2(subtotal * tax_rate / 100.0);
    let total = round2(subtotal + tax_amount);
    (discount_amount, subtotal, tax_amount, total)
}

fn round2(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}

fn empty_create_dto(document_date: chrono::NaiveDate) -> CreateTransactionDto {
    CreateTransactionDto {
        document_number: None,
        document_date,
        due_date: None,
        valid_until: None,
        expected_date: None,
        delivery_date: None,
        customer_id: None,
        supplier_id: None,
        warehouse_id: None,
        quotation_id: None,
        sales_order_id: None,
        delivery_id: None,
        purchase_order_id: None,
        goods_receipt_id: None,
        payment_term_id: None,
        tax_rate_id: None,
        salesperson_id: None,
        prepared_by: None,
        bank_account_id: None,
        payment_method: None,
        reference_number: None,
        shipping_address: None,
        notes: None,
        actor: None,
        status: None,
        lines: Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calculates_line_with_discount_and_tax() {
        let (discount, subtotal, tax, total) = calculate_line(2.0, 150_000.0, 10.0, 11.0);
        assert_eq!(discount, 30_000.0);
        assert_eq!(subtotal, 270_000.0);
        assert_eq!(tax, 29_700.0);
        assert_eq!(total, 299_700.0);
    }

    #[test]
    fn calculates_line_without_discount_or_tax() {
        let (discount, subtotal, tax, total) = calculate_line(3.0, 100_000.0, 0.0, 0.0);
        assert_eq!(discount, 0.0);
        assert_eq!(subtotal, 300_000.0);
        assert_eq!(tax, 0.0);
        assert_eq!(total, 300_000.0);
    }

    #[test]
    fn document_chain_matches_erp_flow() {
        assert_eq!(
            DocumentType::SalesOrder.parent_type(),
            Some(DocumentType::Quotation)
        );
        assert_eq!(
            DocumentType::Delivery.parent_type(),
            Some(DocumentType::SalesOrder)
        );
        assert_eq!(
            DocumentType::SalesInvoice.parent_type(),
            Some(DocumentType::Delivery)
        );
        assert_eq!(
            DocumentType::CustomerReceipt.parent_type(),
            Some(DocumentType::SalesInvoice)
        );
        assert_eq!(
            DocumentType::GoodsReceipt.parent_type(),
            Some(DocumentType::PurchaseOrder)
        );
        assert_eq!(
            DocumentType::PurchaseInvoice.parent_type(),
            Some(DocumentType::GoodsReceipt)
        );
        assert_eq!(
            DocumentType::VendorPayment.parent_type(),
            Some(DocumentType::PurchaseInvoice)
        );
        assert_eq!(DocumentType::Quotation.parent_type(), None);
        assert_eq!(DocumentType::PurchaseOrder.parent_type(), None);
    }

    #[test]
    fn auto_posted_documents_are_not_approvable() {
        assert!(DocumentType::Quotation.is_approvable());
        assert!(DocumentType::SalesOrder.is_approvable());
        assert!(DocumentType::PurchaseOrder.is_approvable());
        assert!(DocumentType::Delivery.is_auto_posted());
        assert!(DocumentType::SalesInvoice.is_auto_posted());
        assert!(DocumentType::CustomerReceipt.is_auto_posted());
        assert!(DocumentType::GoodsReceipt.is_auto_posted());
        assert!(DocumentType::PurchaseInvoice.is_auto_posted());
        assert!(DocumentType::VendorPayment.is_auto_posted());
    }
}
