-- Indexes from accounting_admin_db.sql section 8.
-- Created after all tables so every referenced table exists.

CREATE INDEX IF NOT EXISTS idx_product_category ON masterdata_product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_base_uom ON masterdata_product(base_uom_id);
CREATE INDEX IF NOT EXISTS idx_customer_payment_term ON masterdata_customer(payment_term_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payment_term ON masterdata_supplier(payment_term_id);
CREATE INDEX IF NOT EXISTS idx_employee_department ON masterdata_employee(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_cost_center ON masterdata_employee(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_bank_account_coa ON masterdata_bank_account(coa_id);
CREATE INDEX IF NOT EXISTS idx_config_group ON masterdata_config(config_group, config_key);


CREATE INDEX IF NOT EXISTS idx_report_snapshot_period ON report_snapshot(period_id, report_code, version);
CREATE INDEX IF NOT EXISTS idx_report_snapshot_closing ON report_snapshot(closing_id);
CREATE INDEX IF NOT EXISTS idx_report_snapshot_generated ON report_snapshot(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_snapshot_line_snapshot ON report_snapshot_line(snapshot_id, line_number);

CREATE INDEX IF NOT EXISTS idx_journal_period ON accounting_journal(period_id);
CREATE INDEX IF NOT EXISTS idx_journal_date ON accounting_journal(journal_date);
CREATE INDEX IF NOT EXISTS idx_journal_status ON accounting_journal(status);
CREATE INDEX IF NOT EXISTS idx_journal_reference ON accounting_journal(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_detail_coa ON accounting_journal_detail(coa_id);
CREATE INDEX IF NOT EXISTS idx_journal_detail_dept ON accounting_journal_detail(department_id);
CREATE INDEX IF NOT EXISTS idx_journal_detail_employee ON accounting_journal_detail(employee_id);

CREATE INDEX IF NOT EXISTS idx_budget_plan_dept ON budget_plan(department_id);
CREATE INDEX IF NOT EXISTS idx_budget_plan_detail_coa ON budget_plan_detail(coa_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocation_plan ON budget_allocation(budget_plan_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocation_detail_coa ON budget_allocation_detail(coa_id);

CREATE INDEX IF NOT EXISTS idx_quotation_customer ON transaction_quotation(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_date ON transaction_quotation(document_date);
CREATE INDEX IF NOT EXISTS idx_quotation_detail_product ON transaction_quotation_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_customer ON transaction_sales_order(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_date ON transaction_sales_order(document_date);
CREATE INDEX IF NOT EXISTS idx_sales_order_detail_product ON transaction_sales_order_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_delivery_order ON transaction_delivery(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_detail_product ON transaction_delivery_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_customer_status ON transaction_sales_invoice(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_due_date ON transaction_sales_invoice(due_date);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_detail_product ON transaction_sales_invoice_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_receipt_customer ON transaction_customer_receipt(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_receipt_detail_invoice ON transaction_customer_receipt_detail(sales_invoice_id);
CREATE INDEX IF NOT EXISTS idx_sales_return_invoice ON transaction_sales_return(sales_invoice_id);
CREATE INDEX IF NOT EXISTS idx_sales_return_detail_product ON transaction_sales_return_detail(product_id);

CREATE INDEX IF NOT EXISTS idx_purchase_order_supplier ON transaction_purchase_order(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_date ON transaction_purchase_order(document_date);
CREATE INDEX IF NOT EXISTS idx_purchase_order_detail_product ON transaction_purchase_order_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_order ON transaction_goods_receipt(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_detail_product ON transaction_goods_receipt_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_invoice_supplier_status ON transaction_purchase_invoice(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_invoice_due_date ON transaction_purchase_invoice(due_date);
CREATE INDEX IF NOT EXISTS idx_purchase_invoice_detail_product ON transaction_purchase_invoice_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payment_supplier ON transaction_vendor_payment(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payment_detail_invoice ON transaction_vendor_payment_detail(purchase_invoice_id);
CREATE INDEX IF NOT EXISTS idx_purchase_return_invoice ON transaction_purchase_return(purchase_invoice_id);
CREATE INDEX IF NOT EXISTS idx_purchase_return_detail_product ON transaction_purchase_return_detail(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_movement_warehouse_date ON inventory_stock_movement(warehouse_id, document_date);
CREATE INDEX IF NOT EXISTS idx_stock_movement_reference ON inventory_stock_movement(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movement_detail_product ON inventory_stock_movement_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_warehouse ON inventory_stock_adjustment(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_detail_product ON inventory_stock_adjustment_detail(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_balance_warehouse ON inventory_stock_balance(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_valuation_warehouse ON inventory_valuation(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_valuation_detail_product ON inventory_valuation_detail(product_id);

CREATE INDEX IF NOT EXISTS idx_expense_department ON accounting_expense(department_id);
CREATE INDEX IF NOT EXISTS idx_expense_date ON accounting_expense(document_date);
CREATE INDEX IF NOT EXISTS idx_expense_detail_coa ON accounting_expense_detail(coa_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_bank ON accounting_bank_reconciliation(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_detail_journal ON accounting_bank_reconciliation_detail(matched_journal_detail_id);

CREATE INDEX IF NOT EXISTS idx_attendance_detail_employee ON hrm_attendance_detail(employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_leave_employee ON hrm_leave_request(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_employee ON hrm_overtime(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON hrm_payroll_run(period_code);
CREATE INDEX IF NOT EXISTS idx_payroll_detail_employee ON hrm_payroll_detail(employee_id);
CREATE INDEX IF NOT EXISTS idx_statutory_payroll ON hrm_statutory_contribution(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_salary_payment_payroll ON hrm_salary_payment(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_claim_employee ON hrm_claim(employee_id);
CREATE INDEX IF NOT EXISTS idx_advance_employee ON hrm_advance(employee_id);
