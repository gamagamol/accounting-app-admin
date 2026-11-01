-- Root transaction lifecycle.
--
-- Every document that starts a business cycle (quotation, purchase order,
-- expense, budget plan) receives a root_transaction_id. Every downstream
-- document inherits the same value, including 1-to-N partial deliveries,
-- goods receipts and payments. The audit timeline is then queried by this
-- single root id instead of per-document id/number.
--
-- Format: ROOT-YYYYMMDD-000001 (sequence based, concurrency safe).

CREATE SEQUENCE IF NOT EXISTS root_transaction_seq START WITH 1 INCREMENT BY 1;

ALTER TABLE transaction_quotation
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE transaction_sales_order
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE transaction_delivery
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE transaction_sales_invoice
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE transaction_customer_receipt
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE transaction_purchase_order
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE transaction_goods_receipt
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE transaction_purchase_invoice
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE transaction_vendor_payment
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE accounting_expense
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE budget_plan
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);
ALTER TABLE budget_allocation
    ADD COLUMN IF NOT EXISTS root_transaction_id VARCHAR(64);

-- ---------------------------------------------------------------------------
-- Backfill existing data. Origins receive a fresh root, then the value is
-- propagated down each chain. Partial children (many deliveries per order,
-- many payments per invoice) all keep the origin root.
-- ---------------------------------------------------------------------------

UPDATE transaction_quotation
SET root_transaction_id = 'ROOT-' || to_char(document_date, 'YYYYMMDD') || '-' ||
                          lpad(nextval('root_transaction_seq')::text, 6, '0')
WHERE root_transaction_id IS NULL;

UPDATE transaction_purchase_order
SET root_transaction_id = 'ROOT-' || to_char(document_date, 'YYYYMMDD') || '-' ||
                          lpad(nextval('root_transaction_seq')::text, 6, '0')
WHERE root_transaction_id IS NULL;

UPDATE accounting_expense
SET root_transaction_id = 'ROOT-' || to_char(document_date, 'YYYYMMDD') || '-' ||
                          lpad(nextval('root_transaction_seq')::text, 6, '0')
WHERE root_transaction_id IS NULL;

UPDATE budget_plan
SET root_transaction_id = 'ROOT-' || to_char(created_at::date, 'YYYYMMDD') || '-' ||
                          lpad(nextval('root_transaction_seq')::text, 6, '0')
WHERE root_transaction_id IS NULL;

-- Sales chain ---------------------------------------------------------------
UPDATE transaction_sales_order so
SET root_transaction_id = q.root_transaction_id
FROM transaction_quotation q
WHERE so.quotation_id = q.id
  AND so.root_transaction_id IS NULL
  AND q.root_transaction_id IS NOT NULL;

UPDATE transaction_sales_order
SET root_transaction_id = 'ROOT-' || to_char(document_date, 'YYYYMMDD') || '-' ||
                          lpad(nextval('root_transaction_seq')::text, 6, '0')
WHERE root_transaction_id IS NULL;

UPDATE transaction_delivery d
SET root_transaction_id = so.root_transaction_id
FROM transaction_sales_order so
WHERE d.sales_order_id = so.id
  AND d.root_transaction_id IS NULL;

UPDATE transaction_sales_invoice si
SET root_transaction_id = COALESCE(d.root_transaction_id, so.root_transaction_id)
FROM transaction_delivery d
LEFT JOIN transaction_sales_order so ON so.id = d.sales_order_id
WHERE si.delivery_id = d.id
  AND si.root_transaction_id IS NULL;

UPDATE transaction_sales_invoice si
SET root_transaction_id = so.root_transaction_id
FROM transaction_sales_order so
WHERE si.sales_order_id = so.id
  AND si.root_transaction_id IS NULL;

UPDATE transaction_customer_receipt r
SET root_transaction_id = sub.root_transaction_id
FROM (
    SELECT cr.id,
           MIN(si.root_transaction_id) AS root_transaction_id
    FROM transaction_customer_receipt cr
    JOIN transaction_customer_receipt_detail crd ON crd.customer_receipt_id = cr.id
    JOIN transaction_sales_invoice si ON si.id = crd.sales_invoice_id
    WHERE si.root_transaction_id IS NOT NULL
    GROUP BY cr.id
) sub
WHERE r.id = sub.id
  AND r.root_transaction_id IS NULL;

UPDATE transaction_customer_receipt
SET root_transaction_id = 'ROOT-' || to_char(document_date, 'YYYYMMDD') || '-' ||
                          lpad(nextval('root_transaction_seq')::text, 6, '0')
WHERE root_transaction_id IS NULL;

-- Purchase chain ------------------------------------------------------------
UPDATE transaction_goods_receipt gr
SET root_transaction_id = po.root_transaction_id
FROM transaction_purchase_order po
WHERE gr.purchase_order_id = po.id
  AND gr.root_transaction_id IS NULL;

UPDATE transaction_purchase_invoice pi
SET root_transaction_id = COALESCE(gr.root_transaction_id, po.root_transaction_id)
FROM transaction_goods_receipt gr
LEFT JOIN transaction_purchase_order po ON po.id = gr.purchase_order_id
WHERE pi.goods_receipt_id = gr.id
  AND pi.root_transaction_id IS NULL;

UPDATE transaction_purchase_invoice pi
SET root_transaction_id = po.root_transaction_id
FROM transaction_purchase_order po
WHERE pi.purchase_order_id = po.id
  AND pi.root_transaction_id IS NULL;

UPDATE transaction_vendor_payment vp
SET root_transaction_id = sub.root_transaction_id
FROM (
    SELECT v.id,
           MIN(pi.root_transaction_id) AS root_transaction_id
    FROM transaction_vendor_payment v
    JOIN transaction_vendor_payment_detail vpd ON vpd.vendor_payment_id = v.id
    JOIN transaction_purchase_invoice pi ON pi.id = vpd.purchase_invoice_id
    WHERE pi.root_transaction_id IS NOT NULL
    GROUP BY v.id
) sub
WHERE vp.id = sub.id
  AND vp.root_transaction_id IS NULL;

UPDATE transaction_vendor_payment
SET root_transaction_id = 'ROOT-' || to_char(document_date, 'YYYYMMDD') || '-' ||
                          lpad(nextval('root_transaction_seq')::text, 6, '0')
WHERE root_transaction_id IS NULL;

-- Budget chain --------------------------------------------------------------
UPDATE budget_allocation ba
SET root_transaction_id = bp.root_transaction_id
FROM budget_plan bp
WHERE ba.budget_plan_id = bp.id
  AND ba.root_transaction_id IS NULL;

UPDATE budget_allocation
SET root_transaction_id = 'ROOT-' || to_char(created_at::date, 'YYYYMMDD') || '-' ||
                          lpad(nextval('root_transaction_seq')::text, 6, '0')
WHERE root_transaction_id IS NULL;

-- ---------------------------------------------------------------------------
-- Enforce and index.
-- ---------------------------------------------------------------------------
ALTER TABLE transaction_quotation       ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE transaction_sales_order     ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE transaction_delivery        ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE transaction_sales_invoice   ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE transaction_customer_receipt ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE transaction_purchase_order  ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE transaction_goods_receipt   ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE transaction_purchase_invoice ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE transaction_vendor_payment  ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE accounting_expense          ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE budget_plan                 ALTER COLUMN root_transaction_id SET NOT NULL;
ALTER TABLE budget_allocation           ALTER COLUMN root_transaction_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quotation_root        ON transaction_quotation(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_root      ON transaction_sales_order(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_delivery_root         ON transaction_delivery(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_root    ON transaction_sales_invoice(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_customer_receipt_root ON transaction_customer_receipt(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_root   ON transaction_purchase_order(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_root    ON transaction_goods_receipt(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchase_invoice_root ON transaction_purchase_invoice(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payment_root   ON transaction_vendor_payment(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_expense_root          ON accounting_expense(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_budget_plan_root      ON budget_plan(root_transaction_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocation_root ON budget_allocation(root_transaction_id);
