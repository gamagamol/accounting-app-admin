-- Master data seed from accounting_admin_db.sql section 10.
-- The statements are idempotent through ON CONFLICT / NOT EXISTS guards.

INSERT INTO masterdata_user (username, name, email, role, password_hash) VALUES
('superadmin', 'Gama Ariefsadya', 'superadmin@byond.co.id', 'SUPER_ADMIN', '$2y$10$xCLFDY8J97QAzzqrqJgW2eTbrKzRFxm3umyiBiriYQvI9ryKzBeWK'),
('salesadmin', 'Gama Sales', 'sales@byond.co.id', 'SALES_ADMIN', '$2y$10$tcRg/UUJ9dNliDqtJIMwi.exCSOwlroUFDdE2WRo5DVTGdaP1dGrC'),
('accountingadmin', 'Gama Accounting', 'accounting@byond.co.id', 'ACCOUNTING_ADMIN', '$2y$10$H8kbPoEnlnncaJC0CzgYfOeaF0GEKZpoY3x/vYkSyjR5070lkUEMK'),
('owner', 'Gama Owner', 'owner@byond.co.id', 'OWNER', '$2y$10$QQYwe0eNriUAPMMZwvebPOKxmxnZwpYrR/h9Cz.5ZbkT5tOEH5IyC')
ON CONFLICT (username) DO NOTHING;

INSERT INTO masterdata_department (code, name) VALUES
('FIN', 'Finance'),
('SALES', 'Sales'),
('OPS', 'Operations'),
('HR', 'Human Resources')
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_cost_center (code, name, department_id)
SELECT v.code, v.name, d.id
FROM (VALUES
    ('CC-FIN', 'Finance Cost Center', 'FIN'),
    ('CC-SALES', 'Sales Cost Center', 'SALES'),
    ('CC-OPS', 'Operations Cost Center', 'OPS'),
    ('CC-HR', 'HR Cost Center', 'HR')
) AS v(code, name, department_code)
JOIN masterdata_department d ON d.code = v.department_code
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_employee
    (employee_number, user_id, name, position, department_id, cost_center_id, email, status)
SELECT v.employee_number, u.id, v.name, v.position, d.id, cc.id, v.email, 'active'
FROM (VALUES
    ('EMP-001', 'superadmin', 'Gama Ariefsadya', 'Owner', 'FIN', 'CC-FIN', 'superadmin@byond.co.id'),
    ('EMP-002', 'salesadmin', 'Gama Sales', 'Sales Manager', 'SALES', 'CC-SALES', 'sales@byond.co.id'),
    ('EMP-003', 'accountingadmin', 'Gama Accounting', 'Finance Manager', 'FIN', 'CC-FIN', 'accounting@byond.co.id'),
    ('EMP-004', 'owner', 'Gama Operations', 'Operations Manager', 'OPS', 'CC-OPS', 'ops@byond.co.id')
) AS v(employee_number, username, name, position, department_code, cost_center_code, email)
JOIN masterdata_user u ON u.username = v.username
JOIN masterdata_department d ON d.code = v.department_code
JOIN masterdata_cost_center cc ON cc.code = v.cost_center_code
ON CONFLICT (employee_number) DO NOTHING;

UPDATE masterdata_department d
SET manager_employee_id = e.id
FROM masterdata_employee e
WHERE (d.code = 'FIN' AND e.employee_number = 'EMP-003')
   OR (d.code = 'SALES' AND e.employee_number = 'EMP-002')
   OR (d.code = 'OPS' AND e.employee_number = 'EMP-004');

INSERT INTO masterdata_uom (code, name, category) VALUES
('PCS', 'Piece', 'count'),
('KG', 'Kilogram', 'weight'),
('M', 'Meter', 'length'),
('SET', 'Set', 'count'),
('SVC', 'Service', 'service')
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_coa (account_code, account_name, account_type, normal_balance, is_header) VALUES
('1', 'ASSET', 'asset', 'debit', TRUE),
('2', 'LIABILITY', 'liability', 'credit', TRUE),
('3', 'EQUITY', 'equity', 'credit', TRUE),
('4', 'REVENUE', 'revenue', 'credit', TRUE),
('5', 'EXPENSE', 'expense', 'debit', TRUE),
('11', 'CURRENT ASSETS', 'asset', 'debit', TRUE),
('21', 'TAX PAYABLES', 'liability', 'credit', TRUE),
('22', 'ACCRUED LIABILITIES', 'liability', 'credit', TRUE)
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO masterdata_coa (account_code, account_name, account_type, normal_balance, parent_id, is_header)
SELECT v.account_code, v.account_name, v.account_type, v.normal_balance, p.id, FALSE
FROM (VALUES
    ('111', 'CASH', 'asset', 'debit', '11'),
    ('112', 'ACCOUNT RECEIVABLE', 'asset', 'debit', '11'),
    ('113', 'INVENTORY', 'asset', 'debit', '11'),
    ('114', 'PREPAID EXPENSES', 'asset', 'debit', '11'),
    ('210', 'ACCOUNTS PAYABLE', 'liability', 'credit', '2'),
    ('211', 'VAT PAYABLE', 'liability', 'credit', '21'),
    ('212', 'PPh 23 PAYABLE', 'liability', 'credit', '21'),
    ('221', 'BPJS PAYABLE', 'liability', 'credit', '22'),
    ('222', 'SALARY PAYABLE', 'liability', 'credit', '22'),
    ('310', 'RETAINED EARNINGS', 'equity', 'credit', '3'),
    ('311', 'OWNER EQUITY', 'equity', 'credit', '3'),
    ('411', 'SALES', 'revenue', 'credit', '4'),
    ('412', 'SALES RETURNS', 'revenue', 'debit', '4'),
    ('500', 'COST OF GOODS SOLD', 'expense', 'debit', '5'),
    ('510', 'SALARY EXPENSE', 'expense', 'debit', '5'),
    ('520', 'RENT EXPENSE', 'expense', 'debit', '5'),
    ('530', 'UTILITY EXPENSE', 'expense', 'debit', '5'),
    ('540', 'OFFICE SUPPLIES EXPENSE', 'expense', 'debit', '5'),
    ('550', 'LOGISTICS EXPENSE', 'expense', 'debit', '5'),
    ('560', 'MAINTENANCE EXPENSE', 'expense', 'debit', '5'),
    ('570', 'TRAVEL EXPENSE', 'expense', 'debit', '5'),
    ('580', 'OTHER EXPENSE', 'expense', 'debit', '5')
) AS v(account_code, account_name, account_type, normal_balance, parent_code)
JOIN masterdata_coa p ON p.account_code = v.parent_code
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO masterdata_tax_rate (code, name, rate, tax_type, description) VALUES
('PPN11', 'PPN 11% Sales', 11, 'sales', 'Value added tax on sales'),
('PPN11_PURCHASE', 'PPN 11% Purchase', 11, 'purchase', 'Value added tax on purchases'),
('PPH23', 'PPh 23', 2, 'withholding', 'Withholding tax on services')
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_payment_term (code, name, days) VALUES
('CASH', 'Cash', 0),
('NET14', 'Net 14 Days', 14),
('NET30', 'Net 30 Days', 30)
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_customer
    (customer_code, company_name, city, contact_person, email, phone, npwp, npwp_address, address, payment_term_id, notes)
SELECT v.customer_code, v.company_name, v.city, v.contact_person, v.email, '', '', '', v.address, pt.id, ''
FROM (VALUES
    ('P001', 'MOL''S', 'Jakarta', 'GAMA', 'gamaariefsadya@gmail.com', 'JALAN JAKARTA 4 NO.7, RT 03/RW 02 ANTAPANI KULON JAKARTA'),
    ('P002', 'Mol''s Academy', 'Bandung', 'Gama Gamol', 'gamaariefsadya@gmail.com', 'Bandung')
) AS v(customer_code, company_name, city, contact_person, email, address)
JOIN masterdata_payment_term pt ON pt.code = 'NET30'
ON CONFLICT (customer_code) DO NOTHING;

INSERT INTO masterdata_supplier
    (supplier_code, company_name, contact_person, email, phone, address, city, npwp, payment_term_id, notes)
SELECT v.supplier_code, v.company_name, v.contact_person, '', '', v.address, v.city, '', pt.id, ''
FROM (VALUES
    ('SUP001', 'Suwandi', 'Suwandi', 'Bandung', 'Bandung'),
    ('SUP002', 'GAMA ARIEFSADYA', 'GAMA ARIEFSADYA', 'Bandung', 'Bandung')
) AS v(supplier_code, company_name, contact_person, city, address)
JOIN masterdata_payment_term pt ON pt.code = 'NET30'
ON CONFLICT (supplier_code) DO NOTHING;

INSERT INTO masterdata_product_category (code, name) VALUES
('MACHINERY_STEEL', 'Machinery Steel'),
('COLD_WORK', 'Cold Work')
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_product_account_mapping
    (product_category_id, inventory_account_id, sales_account_id, cogs_account_id, return_account_id)
SELECT pc.id, inv.id, sales.id, cogs.id, ret.id
FROM masterdata_product_category pc
JOIN masterdata_coa inv ON inv.account_code = '113'
JOIN masterdata_coa sales ON sales.account_code = '411'
JOIN masterdata_coa cogs ON cogs.account_code = '500'
JOIN masterdata_coa ret ON ret.account_code = '412'
WHERE pc.code IN ('MACHINERY_STEEL', 'COLD_WORK')
ON CONFLICT (product_category_id) DO NOTHING;

INSERT INTO masterdata_product
    (product_code, name, item_type, category_id, base_uom_id, selling_price, cost_price, description)
SELECT v.product_code, v.name, 'goods', pc.id, u.id, 0, 0, v.description
FROM (VALUES
    ('SKS4', 'CYLINDER', 'MACHINERY_STEEL', 'Legacy product SKS4'),
    ('SK45C', 'FLAT', 'COLD_WORK', 'Legacy product SK45C'),
    ('SKS46', 'FLAT', 'MACHINERY_STEEL', 'Legacy product SKS46')
) AS v(product_code, name, category_code, description)
JOIN masterdata_product_category pc ON pc.code = v.category_code
JOIN masterdata_uom u ON u.code = 'PCS'
ON CONFLICT (product_code) DO NOTHING;

INSERT INTO masterdata_warehouse (code, name, location, manager_employee_id)
SELECT 'MAIN', 'Main Warehouse', 'Jakarta', e.id
FROM masterdata_employee e
WHERE e.employee_number = 'EMP-004'
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_bank_account
    (code, bank_name, account_number, account_holder, currency_code, coa_id, opening_balance, current_balance)
SELECT v.code, v.bank_name, v.account_number, v.account_holder, 'IDR', c.id, 0, 0
FROM (VALUES
    ('BCA', 'Bank Central Asia', '1234567890', 'PT Ibaraki'),
    ('CASH', 'Cash', 'CASH-001', 'PT Ibaraki')
) AS v(code, bank_name, account_number, account_holder)
JOIN masterdata_coa c ON c.account_code = '111'
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_payroll_component (code, name, component_type, taxable, coa_id)
SELECT v.code, v.name, v.component_type, v.taxable, c.id
FROM (VALUES
    ('BASIC', 'Basic Salary', 'earning', TRUE, '510'),
    ('TRANSPORT', 'Transport Allowance', 'earning', TRUE, '510'),
    ('BPJS_KES', 'BPJS Kesehatan Employer', 'employer_contribution', FALSE, '221'),
    ('PPH21', 'PPh 21', 'deduction', FALSE, '212')
) AS v(code, name, component_type, taxable, coa_code)
JOIN masterdata_coa c ON c.account_code = v.coa_code
ON CONFLICT (code) DO NOTHING;

INSERT INTO masterdata_company_profile
    (company_name, address, phone, email, npwp, currency_code, default_tax_rate_id)
SELECT 'PT Ibaraki', 'Jakarta', '', 'info@byond.co.id', '', 'IDR', tr.id
FROM masterdata_tax_rate tr
WHERE tr.code = 'PPN11'
  AND NOT EXISTS (SELECT 1 FROM masterdata_company_profile);

INSERT INTO masterdata_config
    (config_key, config_value, config_group, data_type, description, is_public)
VALUES
    ('company.name', '"PT Ibaraki"'::jsonb, 'company', 'string',
     'Display name used in reports and documents.', TRUE),
    ('company.currency', '"IDR"'::jsonb, 'company', 'string',
     'Default currency code.', TRUE),
    ('accounting.auto_lock_on_close', 'true'::jsonb, 'accounting', 'boolean',
     'Reject new postings when the accounting period is closed.', FALSE),
    ('report.snapshot_on_close', 'true'::jsonb, 'report', 'boolean',
     'Freeze report output into report_snapshot when a period is closed.', FALSE),
    ('report.snapshot_required_for_closed', 'true'::jsonb, 'report', 'boolean',
     'Read closed-period reports from snapshots instead of live views.', FALSE),
    ('app.timezone', '"Asia/Jakarta"'::jsonb, 'general', 'string',
     'Timezone used for audit timestamps and report display.', TRUE)
ON CONFLICT (config_key) DO NOTHING;
