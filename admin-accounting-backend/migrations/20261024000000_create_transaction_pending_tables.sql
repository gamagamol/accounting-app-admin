-- Pending approval history for every business transaction.
--
-- Each transaction type owns a separate table named
-- `transaction_<transaction_type>_pending`. A row represents one pending
-- request: who asked for approval, why, and who approved or rejected it.
--
-- The application never creates these tables at runtime. Add schema changes as
-- new migration files so SQLx applies them at startup.

DO $$
DECLARE
    transaction_type text;
BEGIN
    FOREACH transaction_type IN ARRAY ARRAY[
        'quotation',
        'sales_order',
        'purchase_order',
        'delivery_order',
        'goods_receipt',
        'sales_invoice',
        'customer_receipt',
        'vendor_payment',
        'debt_payment',
        'purchase_invoice',
        'sales_return',
        'purchase_return',
        'stock_movement',
        'stock_adjustment',
        'annual_budget',
        'budget_allocation',
        'budget_revision',
        'expense',
        'journal_entry',
        'bank_reconciliation',
        'period_closing'
    ]
    LOOP
        EXECUTE format(
            $sql$
            CREATE TABLE IF NOT EXISTS transaction_%I_pending (
                id UUID PRIMARY KEY,
                transaction_id TEXT NOT NULL,
                transaction_number TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
                requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                requested_by TEXT NOT NULL,
                pending_message TEXT NOT NULL DEFAULT '',
                approved_at TIMESTAMPTZ,
                approved_by TEXT,
                approval_message TEXT NOT NULL DEFAULT '',
                rejected_at TIMESTAMPTZ,
                rejected_by TEXT,
                rejection_message TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            $sql$,
            transaction_type
        );

        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS transaction_%I_pending_transaction_idx
             ON transaction_%I_pending (transaction_id, requested_at DESC)',
            transaction_type,
            transaction_type
        );

        -- Only one request may be waiting for a decision at a time. Decided
        -- rows remain in the table as history and do not block a new request.
        EXECUTE format(
            'CREATE UNIQUE INDEX IF NOT EXISTS transaction_%I_pending_active_idx
             ON transaction_%I_pending (transaction_id)
             WHERE status = ''pending''',
            transaction_type,
            transaction_type
        );

        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS transaction_%I_pending_status_idx
             ON transaction_%I_pending (status, requested_at DESC)',
            transaction_type,
            transaction_type
        );
    END LOOP;
END $$;
