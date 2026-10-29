-- Reporting views from accounting_admin_db.sql section 11.
-- Views are replaced when this migration is applied so the definitions stay in
-- sync with the tables created above.

CREATE OR REPLACE VIEW report_outstanding_receivable AS
SELECT
    si.id AS sales_invoice_id,
    si.document_number,
    si.document_date,
    si.due_date,
    c.id AS customer_id,
    c.company_name AS customer_name,
    si.grand_total,
    si.paid_amount,
    (si.grand_total - si.paid_amount) AS outstanding_amount,
    (CURRENT_DATE - si.due_date) AS days_overdue,
    CASE
        WHEN si.grand_total <= si.paid_amount THEN 'paid'
        WHEN si.due_date < CURRENT_DATE THEN 'overdue'
        ELSE 'current'
    END AS aging_status
FROM transaction_sales_invoice si
JOIN masterdata_customer c ON c.id = si.customer_id
WHERE si.status NOT IN ('rejected')
  AND si.grand_total > si.paid_amount;

CREATE OR REPLACE VIEW report_outstanding_payable AS
SELECT
    pi.id AS purchase_invoice_id,
    pi.document_number,
    pi.document_date,
    pi.due_date,
    s.id AS supplier_id,
    s.company_name AS supplier_name,
    pi.grand_total,
    pi.paid_amount,
    (pi.grand_total - pi.paid_amount) AS outstanding_amount,
    (CURRENT_DATE - pi.due_date) AS days_overdue,
    CASE
        WHEN pi.grand_total <= pi.paid_amount THEN 'paid'
        WHEN pi.due_date < CURRENT_DATE THEN 'overdue'
        ELSE 'current'
    END AS aging_status
FROM transaction_purchase_invoice pi
JOIN masterdata_supplier s ON s.id = pi.supplier_id
WHERE pi.status NOT IN ('rejected')
  AND pi.grand_total > pi.paid_amount;

CREATE OR REPLACE VIEW report_aging_schedule AS
SELECT
    customer_name,
    document_number,
    due_date,
    outstanding_amount,
    days_overdue,
    CASE
        WHEN days_overdue <= 0 THEN 'current'
        WHEN days_overdue <= 30 THEN '1-30 days'
        WHEN days_overdue <= 60 THEN '31-60 days'
        WHEN days_overdue <= 90 THEN '61-90 days'
        ELSE 'over 90 days'
    END AS aging_bucket
FROM report_outstanding_receivable;

CREATE OR REPLACE VIEW report_stock_card AS
SELECT
    m.document_number,
    m.document_date,
    m.movement_type,
    m.reference_type,
    m.reference_id,
    p.product_code,
    p.name AS product_name,
    w.name AS warehouse_name,
    d.quantity,
    d.unit_cost,
    d.total_cost
FROM inventory_stock_movement m
JOIN inventory_stock_movement_detail d ON d.movement_id = m.id
JOIN masterdata_product p ON p.id = d.product_id
JOIN masterdata_warehouse w ON w.id = m.warehouse_id
WHERE m.status = 'completed';

CREATE OR REPLACE VIEW report_general_ledger AS
SELECT
    j.id AS journal_id,
    j.journal_number,
    j.journal_date AS date,
    coa.account_code,
    coa.account_name,
    jd.description,
    jd.debit,
    jd.credit,
    (jd.debit - jd.credit) AS balance,
    j.reference_type,
    j.reference_id
FROM accounting_journal j
JOIN accounting_journal_detail jd ON jd.journal_id = j.id
JOIN masterdata_coa coa ON coa.id = jd.coa_id
WHERE j.status = 'completed';

CREATE OR REPLACE VIEW report_trial_balance AS
SELECT
    coa.id AS coa_id,
    coa.account_code,
    coa.account_name,
    coa.account_type,
    COALESCE(SUM(CASE WHEN j.id IS NOT NULL THEN jd.debit ELSE 0 END), 0) AS total_debit,
    COALESCE(SUM(CASE WHEN j.id IS NOT NULL THEN jd.credit ELSE 0 END), 0) AS total_credit,
    COALESCE(SUM(CASE WHEN j.id IS NOT NULL THEN jd.debit - jd.credit ELSE 0 END), 0) AS balance
FROM masterdata_coa coa
LEFT JOIN accounting_journal_detail jd ON jd.coa_id = coa.id
LEFT JOIN accounting_journal j ON j.id = jd.journal_id AND j.status = 'completed'
WHERE coa.is_header = FALSE
GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type;

CREATE OR REPLACE VIEW report_profit_loss AS
SELECT
    account_type,
    account_code,
    account_name,
    total_debit,
    total_credit,
    CASE WHEN account_type = 'revenue' THEN -balance ELSE balance END AS amount
FROM report_trial_balance
WHERE account_type IN ('revenue', 'expense');

CREATE OR REPLACE VIEW report_balance_sheet AS
SELECT
    account_type,
    account_code,
    account_name,
    CASE WHEN account_type IN ('liability', 'equity') THEN -balance ELSE balance END AS balance
FROM report_trial_balance
WHERE account_type IN ('asset', 'liability', 'equity');

CREATE OR REPLACE VIEW report_cash_flow AS
SELECT
    j.journal_type,
    COALESCE(SUM(jd.debit), 0) AS cash_in,
    COALESCE(SUM(jd.credit), 0) AS cash_out,
    COALESCE(SUM(jd.debit - jd.credit), 0) AS net_cash_flow
FROM accounting_journal j
JOIN accounting_journal_detail jd ON jd.journal_id = j.id
WHERE j.status = 'completed'
  AND EXISTS (
      SELECT 1
      FROM masterdata_bank_account ba
      WHERE ba.coa_id = jd.coa_id
  )
GROUP BY j.journal_type;

CREATE OR REPLACE VIEW report_budget_vs_actual AS
SELECT
    bp.budget_number,
    bp.fiscal_year,
    d.id AS department_id,
    d.name AS department_name,
    coa.account_code,
    coa.account_name,
    bad.allocated_amount,
    COALESCE(SUM(CASE WHEN e.id IS NOT NULL THEN ed.amount ELSE 0 END), 0) AS actual_amount,
    bad.allocated_amount - COALESCE(SUM(CASE WHEN e.id IS NOT NULL THEN ed.amount ELSE 0 END), 0) AS remaining_amount
FROM budget_allocation_detail bad
JOIN budget_allocation ba ON ba.id = bad.budget_allocation_id
JOIN budget_plan bp ON bp.id = ba.budget_plan_id
JOIN masterdata_department d ON d.id = bad.department_id
JOIN masterdata_coa coa ON coa.id = bad.coa_id
LEFT JOIN accounting_expense_detail ed ON ed.budget_allocation_id = bad.id
LEFT JOIN accounting_expense e ON e.id = ed.expense_id AND e.status = 'completed'
GROUP BY
    bp.budget_number,
    bp.fiscal_year,
    d.id,
    d.name,
    coa.account_code,
    coa.account_name,
    bad.allocated_amount;

CREATE OR REPLACE VIEW report_customer_omzet AS
SELECT
    c.id AS customer_id,
    c.customer_code,
    c.company_name,
    COALESCE(SUM(si.grand_total), 0) AS omzet
FROM masterdata_customer c
LEFT JOIN transaction_sales_invoice si
  ON si.customer_id = c.id
 AND si.status NOT IN ('rejected')
GROUP BY c.id, c.customer_code, c.company_name;

CREATE OR REPLACE VIEW report_purchase_by_vendor AS
SELECT
    s.id AS supplier_id,
    s.supplier_code,
    s.company_name,
    COALESCE(SUM(pi.grand_total), 0) AS total_purchase
FROM masterdata_supplier s
LEFT JOIN transaction_purchase_invoice pi
  ON pi.supplier_id = s.id
 AND pi.status NOT IN ('rejected')
GROUP BY s.id, s.supplier_code, s.company_name;

CREATE OR REPLACE VIEW report_order_fulfillment AS
SELECT
    so.id AS sales_order_id,
    so.document_number,
    so.document_date,
    c.company_name AS customer_name,
    so.status,
    COALESCE(SUM(sod.quantity), 0) AS ordered_quantity,
    COALESCE(SUM(sod.quantity_delivered), 0) AS delivered_quantity,
    COALESCE(SUM(sod.quantity_invoiced), 0) AS invoiced_quantity
FROM transaction_sales_order so
JOIN masterdata_customer c ON c.id = so.customer_id
LEFT JOIN transaction_sales_order_detail sod ON sod.sales_order_id = so.id
GROUP BY so.id, so.document_number, so.document_date, c.company_name, so.status;

CREATE OR REPLACE VIEW report_tax_summary AS
SELECT
    source,
    tax_code,
    tax_name,
    SUM(tax_amount) AS tax_amount
FROM (
    SELECT
        'sales' AS source,
        tr.code AS tax_code,
        tr.name AS tax_name,
        d.tax_amount
    FROM transaction_sales_invoice_detail d
    JOIN transaction_sales_invoice i ON i.id = d.sales_invoice_id
    LEFT JOIN masterdata_tax_rate tr ON tr.id = d.tax_rate_id
    WHERE i.status NOT IN ('rejected')
    UNION ALL
    SELECT
        'purchase' AS source,
        tr.code AS tax_code,
        tr.name AS tax_name,
        d.tax_amount
    FROM transaction_purchase_invoice_detail d
    JOIN transaction_purchase_invoice i ON i.id = d.purchase_invoice_id
    LEFT JOIN masterdata_tax_rate tr ON tr.id = d.tax_rate_id
    WHERE i.status NOT IN ('rejected')
) x
GROUP BY source, tax_code, tax_name
ORDER BY source, tax_code;

CREATE OR REPLACE VIEW report_employee_receivable AS
SELECT
    e.id AS employee_id,
    e.employee_number,
    e.name AS employee_name,
    a.advance_number,
    a.request_date,
    a.advance_amount,
    COALESCE(SUM(ad.paid_amount), 0) AS paid_amount,
    a.advance_amount - COALESCE(SUM(ad.paid_amount), 0) AS outstanding_amount
FROM hrm_advance a
JOIN masterdata_employee e ON e.id = a.employee_id
LEFT JOIN hrm_advance_detail ad ON ad.advance_id = a.id
WHERE a.status IN ('approved', 'completed')
GROUP BY
    e.id,
    e.employee_number,
    e.name,
    a.id,
    a.advance_number,
    a.request_date,
    a.advance_amount;

CREATE OR REPLACE VIEW report_headcount_cost AS
SELECT
    d.id AS department_id,
    d.name AS department_name,
    COUNT(DISTINCT e.id) AS headcount,
    COALESCE(SUM(CASE WHEN pr.id IS NOT NULL THEN pd.gross_salary ELSE 0 END), 0) AS payroll_cost
FROM masterdata_department d
LEFT JOIN masterdata_employee e
  ON e.department_id = d.id
 AND e.status = 'active'
LEFT JOIN hrm_payroll_detail pd ON pd.employee_id = e.id
LEFT JOIN hrm_payroll_run pr
  ON pr.id = pd.payroll_run_id
 AND pr.status IN ('approved', 'completed')
GROUP BY d.id, d.name;
