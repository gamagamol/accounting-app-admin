-- Keep master data (customers, suppliers, products, COA, warehouses, users,
-- tax rates, payment terms, bank accounts) but remove operational seed data.
-- Inventory must start empty and bank balances must start at zero.

DELETE FROM inventory_stock_movement_detail;
DELETE FROM inventory_stock_movement;
DELETE FROM inventory_stock_adjustment_detail;
DELETE FROM inventory_stock_adjustment;
DELETE FROM inventory_valuation_detail;
DELETE FROM inventory_valuation;
DELETE FROM inventory_stock_balance;

UPDATE masterdata_bank_account
SET current_balance = 0;

DELETE FROM accounting_journal_detail;
DELETE FROM accounting_journal;
DELETE FROM accounting_expense_detail;
DELETE FROM accounting_expense;
DELETE FROM accounting_bank_reconciliation_detail;
DELETE FROM accounting_bank_reconciliation;
DELETE FROM accounting_period_closing_detail;
DELETE FROM accounting_period_closing;
DELETE FROM accounting_period;

DELETE FROM budget_allocation_detail;
DELETE FROM budget_allocation;
DELETE FROM budget_revision_detail;
DELETE FROM budget_revision;
DELETE FROM budget_plan_detail;
DELETE FROM budget_plan;

DELETE FROM report_lock;
DELETE FROM report_snapshot;
