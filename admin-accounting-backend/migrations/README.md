# Backend migrations

SQLx embeds every `*.sql` file in this directory through
`sqlx::migrate!("./migrations")` and applies pending files when the PostgreSQL
pool starts.

## Naming

Use SQLx's timestamp prefix format:

```text
YYYYMMDDHHMMSS_short_description.sql
```

Files are applied once, in lexicographic order. Add a new file for every schema
change; do not edit an already-applied migration.

## Current schema

- `20261021000000_create_users.sql` creates the users table and its indexes.
- `20261024000000_create_transaction_pending_tables.sql` creates one pending
  history table per transaction type.
- `20261025000001` through `20261025000083` create the 81 business tables from
  `accounting_admin_db.sql`, one table per migration. This range also contains the
  department-manager foreign key and the report-snapshot immutability triggers.
- `20261025000084_create_indexes.sql` creates the non-unique indexes from the
  full schema.
- `20261025000085_create_updated_at_triggers.sql` creates
  `fn_set_updated_at()` and attaches it to every table with an `updated_at`
  column.
- `20261025000086_seed_master_data.sql` seeds the master data used by the
  application.
- `20261025000087_create_report_views.sql` creates all 16 report views.
- `20261028000001_seed_product_prices_and_stock.sql` seeds demo product prices and
  opening inventory stock. The opening stock is removed again by
  `20261029000002_reset_operational_seed_data.sql`.
- `20261028000002_add_current_earnings_to_balance_sheet.sql` adds unclosed
  profit/loss as current period earnings so the balance sheet equation holds.
- `20261028000003_add_live_report_views.sql` adds the live report views used by
  the realtime report endpoints.
- `20261029000001_create_report_lock.sql` creates `report_lock`, which stores a
  locked report snapshot per report code and period.
- `20261029000002_reset_operational_seed_data.sql` clears seeded inventory,
  bank balances, journals, expenses, budgets, and report snapshots while keeping
  master data such as customers, suppliers, products, COA, warehouses, users,
  tax rates, payment terms, and bank accounts.
- `20261029000003_remove_ibaraki_company_profile.sql` replaces the legacy
  `PT Ibaraki` company name, bank account holder, and `company.name` config with
  the neutral `Nama Perusahaan` placeholder. Existing user-edited names are
  preserved.

The destructive drop block and the `BEGIN;` / `COMMIT;` wrapper from
`accounting_admin_db.sql` are intentionally not copied into the migrations. SQLx runs
each migration in its own transaction and records it in `_sqlx_migrations`.

## Full table migration order

The migrations below follow the dependency order in `accounting_admin_db.sql`. Keep new
table migrations after the tables they reference.

### Master data

```text
20261025000001_create_masterdata_user.sql
20261025000002_create_masterdata_department.sql
20261025000003_create_masterdata_cost_center.sql
20261025000004_create_masterdata_employee.sql
20261025000005_add_masterdata_department_manager_fk.sql
20261025000006_create_masterdata_uom.sql
20261025000007_create_masterdata_coa.sql
20261025000008_create_masterdata_tax_rate.sql
20261025000009_create_masterdata_payment_term.sql
20261025000010_create_masterdata_customer.sql
20261025000011_create_masterdata_supplier.sql
20261025000012_create_masterdata_product_category.sql
20261025000013_create_masterdata_product.sql
20261025000014_create_masterdata_product_account_mapping.sql
20261025000015_create_masterdata_warehouse.sql
20261025000016_create_masterdata_bank_account.sql
20261025000017_create_masterdata_payroll_component.sql
20261025000018_create_masterdata_company_profile.sql
20261025000019_create_masterdata_config.sql
```

### Accounting core and budget

```text
20261025000020_create_accounting_period.sql
20261025000021_create_accounting_journal.sql
20261025000022_create_accounting_journal_detail.sql
20261025000023_create_budget_plan.sql
20261025000024_create_budget_plan_detail.sql
20261025000025_create_budget_allocation.sql
20261025000026_create_budget_allocation_detail.sql
20261025000027_create_budget_revision.sql
20261025000028_create_budget_revision_detail.sql
```

### Sales flow

```text
20261025000029_create_transaction_quotation.sql
20261025000030_create_transaction_quotation_detail.sql
20261025000031_create_transaction_sales_order.sql
20261025000032_create_transaction_sales_order_detail.sql
20261025000033_create_transaction_delivery.sql
20261025000034_create_transaction_delivery_detail.sql
20261025000035_create_transaction_sales_invoice.sql
20261025000036_create_transaction_sales_invoice_detail.sql
20261025000037_create_transaction_customer_receipt.sql
20261025000038_create_transaction_customer_receipt_detail.sql
20261025000039_create_transaction_sales_return.sql
20261025000040_create_transaction_sales_return_detail.sql
```

### Purchasing flow

```text
20261025000041_create_transaction_purchase_order.sql
20261025000042_create_transaction_purchase_order_detail.sql
20261025000043_create_transaction_goods_receipt.sql
20261025000044_create_transaction_goods_receipt_detail.sql
20261025000045_create_transaction_purchase_invoice.sql
20261025000046_create_transaction_purchase_invoice_detail.sql
20261025000047_create_transaction_vendor_payment.sql
20261025000048_create_transaction_vendor_payment_detail.sql
20261025000049_create_transaction_purchase_return.sql
20261025000050_create_transaction_purchase_return_detail.sql
```

### Inventory

```text
20261025000051_create_inventory_stock_movement.sql
20261025000052_create_inventory_stock_movement_detail.sql
20261025000053_create_inventory_stock_adjustment.sql
20261025000054_create_inventory_stock_adjustment_detail.sql
20261025000055_create_inventory_stock_balance.sql
20261025000056_create_inventory_valuation.sql
20261025000057_create_inventory_valuation_detail.sql
```

### Expense, reconciliation, closing, and report snapshots

```text
20261025000058_create_accounting_expense.sql
20261025000059_create_accounting_expense_detail.sql
20261025000060_create_accounting_bank_reconciliation.sql
20261025000061_create_accounting_bank_reconciliation_detail.sql
20261025000062_create_accounting_period_closing.sql
20261025000063_create_accounting_period_closing_detail.sql
20261025000064_create_report_snapshot.sql
20261025000065_create_report_snapshot_line.sql
20261025000066_create_report_snapshot_immutability_triggers.sql
```

### HRMIS

```text
20261025000067_create_hrm_attendance_period.sql
20261025000068_create_hrm_attendance_detail.sql
20261025000069_create_hrm_leave_request.sql
20261025000070_create_hrm_leave_request_detail.sql
20261025000071_create_hrm_overtime.sql
20261025000072_create_hrm_overtime_detail.sql
20261025000073_create_hrm_payroll_run.sql
20261025000074_create_hrm_payroll_detail.sql
20261025000075_create_hrm_payroll_detail_component.sql
20261025000076_create_hrm_statutory_contribution.sql
20261025000077_create_hrm_statutory_contribution_detail.sql
20261025000078_create_hrm_salary_payment.sql
20261025000079_create_hrm_salary_payment_detail.sql
20261025000080_create_hrm_claim.sql
20261025000081_create_hrm_claim_detail.sql
20261025000082_create_hrm_advance.sql
20261025000083_create_hrm_advance_detail.sql
```

### Indexes, triggers, seed, and views

```text
20261025000084_create_indexes.sql
20261025000085_create_updated_at_triggers.sql
20261025000086_seed_master_data.sql
20261025000087_create_report_views.sql
20261028000001_seed_product_prices_and_stock.sql
20261028000002_add_current_earnings_to_balance_sheet.sql
20261028000003_add_live_report_views.sql
20261029000001_create_report_lock.sql
20261029000002_reset_operational_seed_data.sql
20261029000003_remove_ibaraki_company_profile.sql
```

## Running migrations

When the backend starts with `DB_DRIVER=postgres`, SQLx embeds the files in
this directory, applies every migration that is not yet in `_sqlx_migrations`,
and then starts the HTTP server. From `admin-accounting-backend`:

```bash
DB_DRIVER=postgres \
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=admin_accounting \
DB_USER=postgres \
DB_PASSWORD=postgres \
DB_SSLMODE=disable \
cargo run --bin admin-accounting-backend
```

The same happens automatically in Docker when the backend service receives
`DB_DRIVER=postgres` and the matching `DB_*` variables. If a migration has
already been applied, do not edit it; add a new timestamped migration instead.

## Pending approval tables

Each transaction type has its own history table named
`transaction_<transaction_type>_pending`. The migration creates 21 tables:

```text
transaction_quotation_pending
transaction_sales_order_pending
transaction_purchase_order_pending
transaction_delivery_order_pending
transaction_goods_receipt_pending
transaction_sales_invoice_pending
transaction_customer_receipt_pending
transaction_vendor_payment_pending
transaction_debt_payment_pending
transaction_purchase_invoice_pending
transaction_sales_return_pending
transaction_purchase_return_pending
transaction_stock_movement_pending
transaction_stock_adjustment_pending
transaction_annual_budget_pending
transaction_budget_allocation_pending
transaction_budget_revision_pending
transaction_expense_pending
transaction_journal_entry_pending
transaction_bank_reconciliation_pending
transaction_period_closing_pending
```

Every table stores the request, approval, and rejection messages separately:

| Column | Purpose |
|---|---|
| `id` | Pending request UUID |
| `transaction_id` | Business document id |
| `transaction_number` | Human-readable document number |
| `status` | `pending`, `approved`, or `rejected` |
| `requested_at`, `requested_by`, `pending_message` | Who asked for approval, when, and why |
| `approved_at`, `approved_by`, `approval_message` | Approval decision |
| `rejected_at`, `rejected_by`, `rejection_message` | Rejection decision |
| `created_at`, `updated_at` | Row timestamps |

A partial unique index on `(transaction_id) WHERE status = 'pending'` ensures a
transaction cannot have two active pending requests. Historical approved and
rejected rows remain in the table for the pending history view.

The backend maps the public transaction type to a table through a static
allowlist in `src/core/pending/entities/pending_request.rs`. Never build a
pending table name from request input.

## Audit trail

Audit events are intentionally **not** stored in PostgreSQL. They live in the
MongoDB collection configured by `MONGO_AUDIT_COLLECTION` (default
`audit_logs`) and are exposed through `/api/audit-logs`.
