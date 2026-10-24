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
