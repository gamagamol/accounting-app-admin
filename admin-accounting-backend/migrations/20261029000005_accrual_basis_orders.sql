-- Accrual-basis order posting.
--
-- Sales orders and purchase orders are the events that recognize revenue,
-- receivable, inventory, VAT and payable. Stock movements now follow those
-- documents so the stock card and financial reports share the same timing.
--
-- The warehouse is captured on the order because stock is posted when the
-- order is created, not when the delivery / goods receipt ticket is created.

ALTER TABLE transaction_sales_order
    ADD COLUMN IF NOT EXISTS warehouse_id BIGINT REFERENCES masterdata_warehouse(id);

ALTER TABLE transaction_purchase_order
    ADD COLUMN IF NOT EXISTS warehouse_id BIGINT REFERENCES masterdata_warehouse(id);

UPDATE transaction_sales_order
SET warehouse_id = (SELECT id FROM masterdata_warehouse ORDER BY id LIMIT 1)
WHERE warehouse_id IS NULL;

UPDATE transaction_purchase_order
SET warehouse_id = (SELECT id FROM masterdata_warehouse ORDER BY id LIMIT 1)
WHERE warehouse_id IS NULL;

-- Revenue and COGS follow the sales order, not the invoice / delivery.
-- Drop first because report_omzet changes invoice_count to order_count.
DROP VIEW IF EXISTS report_gross_profit;
DROP VIEW IF EXISTS report_omzet;
DROP VIEW IF EXISTS report_tax_summary;

CREATE OR REPLACE VIEW report_gross_profit AS
SELECT
    p.id AS product_id,
    p.product_code,
    p.name AS product_name,
    COALESCE(SUM(d.quantity), 0) AS quantity_sold,
    COALESCE(SUM(d.subtotal), 0) AS revenue,
    COALESCE(SUM(d.quantity * COALESCE(p.cost_price, 0)), 0) AS cogs,
    COALESCE(SUM(d.subtotal), 0) - COALESCE(SUM(d.quantity * COALESCE(p.cost_price, 0)), 0) AS gross_profit,
    CASE
        WHEN COALESCE(SUM(d.subtotal), 0) > 0 THEN
            ROUND(
                (COALESCE(SUM(d.subtotal), 0) - COALESCE(SUM(d.quantity * COALESCE(p.cost_price, 0)), 0))
                / COALESCE(SUM(d.subtotal), 0) * 100,
                2
            )
        ELSE 0
    END AS margin_pct
FROM transaction_sales_order_detail d
JOIN transaction_sales_order so ON so.id = d.sales_order_id
JOIN masterdata_product p ON p.id = d.product_id
WHERE so.status NOT IN ('rejected')
GROUP BY p.id, p.product_code, p.name
ORDER BY gross_profit DESC;

CREATE OR REPLACE VIEW report_omzet AS
SELECT
    TO_CHAR(so.document_date, 'YYYY-MM') AS period,
    MIN(so.document_date) AS period_start,
    COUNT(DISTINCT so.id) AS order_count,
    COALESCE(SUM(d.subtotal), 0) AS gross_sales,
    COALESCE(SUM(d.quantity * COALESCE(p.cost_price, 0)), 0) AS cogs,
    COALESCE(SUM(d.subtotal), 0) - COALESCE(SUM(d.quantity * COALESCE(p.cost_price, 0)), 0) AS margin,
    CASE
        WHEN COALESCE(SUM(d.subtotal), 0) > 0 THEN
            ROUND(
                (COALESCE(SUM(d.subtotal), 0) - COALESCE(SUM(d.quantity * COALESCE(p.cost_price, 0)), 0))
                / COALESCE(SUM(d.subtotal), 0) * 100,
                2
            )
        ELSE 0
    END AS margin_pct
FROM transaction_sales_order so
JOIN transaction_sales_order_detail d ON d.sales_order_id = so.id
LEFT JOIN masterdata_product p ON p.id = d.product_id
WHERE so.status NOT IN ('rejected')
GROUP BY TO_CHAR(so.document_date, 'YYYY-MM')
ORDER BY period DESC;

-- Sales VAT is recognized on the sales order; purchase VAT on the purchase order.
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
    FROM transaction_sales_order_detail d
    JOIN transaction_sales_order so ON so.id = d.sales_order_id
    LEFT JOIN masterdata_tax_rate tr ON tr.id = d.tax_rate_id
    WHERE so.status NOT IN ('rejected')
    UNION ALL
    SELECT
        'purchase' AS source,
        tr.code AS tax_code,
        tr.name AS tax_name,
        d.tax_amount
    FROM transaction_purchase_order_detail d
    JOIN transaction_purchase_order po ON po.id = d.purchase_order_id
    LEFT JOIN masterdata_tax_rate tr ON tr.id = d.tax_rate_id
    WHERE po.status NOT IN ('rejected')
) x
GROUP BY source, tax_code, tax_name
ORDER BY source, tax_code;
