-- Realtime operational report views backed directly by transaction tables.
-- Existing views are replaced so reports always reflect the latest documents.

DROP VIEW IF EXISTS report_customer_omzet;
DROP VIEW IF EXISTS report_purchase_by_vendor;
DROP VIEW IF EXISTS report_order_fulfillment;
DROP VIEW IF EXISTS report_gross_profit;
DROP VIEW IF EXISTS report_omzet;
DROP VIEW IF EXISTS report_quotation_detail;
DROP VIEW IF EXISTS report_quotation_vs_po;
DROP VIEW IF EXISTS report_outstanding;
DROP VIEW IF EXISTS report_transaction_tracking;
DROP VIEW IF EXISTS report_stock_card;
DROP VIEW IF EXISTS report_inventory_valuation;

CREATE OR REPLACE VIEW report_customer_omzet AS
SELECT
    c.id AS customer_id,
    c.customer_code,
    c.company_name,
    c.city,
    COUNT(DISTINCT si.id) AS invoice_count,
    COALESCE(SUM(si.grand_total), 0) AS omzet
FROM masterdata_customer c
LEFT JOIN transaction_sales_invoice si
  ON si.customer_id = c.id
 AND si.status NOT IN ('rejected')
GROUP BY c.id, c.customer_code, c.company_name, c.city;

CREATE OR REPLACE VIEW report_purchase_by_vendor AS
SELECT
    s.id AS supplier_id,
    s.supplier_code,
    s.company_name,
    COALESCE(po.order_count, 0) AS order_count,
    COALESCE(po.total_purchase, 0) AS total_purchase,
    COALESCE(pi.invoiced, 0) AS invoiced,
    COALESCE(pi.paid, 0) AS paid,
    COALESCE(pi.invoiced, 0) - COALESCE(pi.paid, 0) AS outstanding
FROM masterdata_supplier s
LEFT JOIN (
    SELECT supplier_id, COUNT(*) AS order_count, SUM(grand_total) AS total_purchase
    FROM transaction_purchase_order
    WHERE status NOT IN ('rejected')
    GROUP BY supplier_id
) po ON po.supplier_id = s.id
LEFT JOIN (
    SELECT supplier_id, SUM(grand_total) AS invoiced, SUM(paid_amount) AS paid
    FROM transaction_purchase_invoice
    WHERE status NOT IN ('rejected')
    GROUP BY supplier_id
) pi ON pi.supplier_id = s.id;

CREATE OR REPLACE VIEW report_order_fulfillment AS
SELECT
    so.id AS sales_order_id,
    so.document_number,
    so.document_date,
    c.company_name AS customer_name,
    so.status,
    so.grand_total AS total_value,
    COALESCE((
        SELECT SUM(sod.quantity)
        FROM transaction_sales_order_detail sod
        WHERE sod.sales_order_id = so.id
    ), 0) AS ordered_quantity,
    COALESCE((
        SELECT SUM(sod.quantity_delivered)
        FROM transaction_sales_order_detail sod
        WHERE sod.sales_order_id = so.id
    ), 0) AS delivered_quantity,
    COALESCE((
        SELECT SUM(sod.quantity_invoiced)
        FROM transaction_sales_order_detail sod
        WHERE sod.sales_order_id = so.id
    ), 0) AS invoiced_quantity,
    (
        SELECT COUNT(*)
        FROM transaction_delivery d
        WHERE d.sales_order_id = so.id
    ) AS delivery_count,
    (
        SELECT d.document_number
        FROM transaction_delivery d
        WHERE d.sales_order_id = so.id
        ORDER BY d.id DESC
        LIMIT 1
    ) AS last_delivery_number
FROM transaction_sales_order so
JOIN masterdata_customer c ON c.id = so.customer_id;

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
FROM transaction_sales_invoice_detail d
JOIN transaction_sales_invoice i ON i.id = d.sales_invoice_id
JOIN masterdata_product p ON p.id = d.product_id
WHERE i.status NOT IN ('rejected')
GROUP BY p.id, p.product_code, p.name
ORDER BY gross_profit DESC;

CREATE OR REPLACE VIEW report_omzet AS
SELECT
    TO_CHAR(i.document_date, 'YYYY-MM') AS period,
    MIN(i.document_date) AS period_start,
    COUNT(DISTINCT i.id) AS invoice_count,
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
FROM transaction_sales_invoice i
JOIN transaction_sales_invoice_detail d ON d.sales_invoice_id = i.id
LEFT JOIN masterdata_product p ON p.id = d.product_id
WHERE i.status NOT IN ('rejected')
GROUP BY TO_CHAR(i.document_date, 'YYYY-MM')
ORDER BY period DESC;

CREATE OR REPLACE VIEW report_quotation_detail AS
SELECT
    q.id AS quotation_id,
    q.document_number AS quotation_number,
    q.document_date,
    q.status,
    c.company_name AS customer_name,
    p.product_code,
    p.name AS product_name,
    d.quantity,
    u.name AS uom_name,
    d.unit_price,
    d.discount_percent,
    d.discount_amount,
    d.tax_amount,
    d.subtotal,
    d.total
FROM transaction_quotation q
JOIN masterdata_customer c ON c.id = q.customer_id
JOIN transaction_quotation_detail d ON d.quotation_id = q.id
LEFT JOIN masterdata_product p ON p.id = d.product_id
LEFT JOIN masterdata_uom u ON u.id = d.uom_id
ORDER BY q.id DESC, d.line_number;

CREATE OR REPLACE VIEW report_quotation_vs_po AS
SELECT
    q.id AS quotation_id,
    q.document_number AS quotation_number,
    q.document_date AS quotation_date,
    q.status AS quotation_status,
    c.company_name AS customer_name,
    q.grand_total AS quotation_total,
    so.id AS sales_order_id,
    so.document_number AS sales_order_number,
    so.document_date AS sales_order_date,
    so.grand_total AS sales_order_total,
    COALESCE(so.grand_total, 0) - q.grand_total AS variance
FROM transaction_quotation q
JOIN masterdata_customer c ON c.id = q.customer_id
LEFT JOIN LATERAL (
    SELECT *
    FROM transaction_sales_order so
    WHERE so.quotation_id = q.id
    ORDER BY so.id DESC
    LIMIT 1
) so ON TRUE
ORDER BY q.id DESC;

CREATE OR REPLACE VIEW report_outstanding AS
SELECT
    'receivable'::text AS category,
    si.document_number,
    c.company_name AS party_name,
    si.document_date,
    si.due_date,
    (si.grand_total - si.paid_amount) AS amount,
    si.status
FROM transaction_sales_invoice si
JOIN masterdata_customer c ON c.id = si.customer_id
WHERE si.status NOT IN ('rejected')
  AND si.grand_total > si.paid_amount

UNION ALL

SELECT
    'payable'::text AS category,
    pi.document_number,
    s.company_name AS party_name,
    pi.document_date,
    pi.due_date,
    (pi.grand_total - pi.paid_amount) AS amount,
    pi.status
FROM transaction_purchase_invoice pi
JOIN masterdata_supplier s ON s.id = pi.supplier_id
WHERE pi.status NOT IN ('rejected')
  AND pi.grand_total > pi.paid_amount

UNION ALL

SELECT
    'pending_delivery'::text AS category,
    so.document_number,
    c.company_name AS party_name,
    so.document_date,
    NULL::date AS due_date,
    COALESCE(SUM((sod.quantity - sod.quantity_delivered) * sod.unit_price), 0) AS amount,
    so.status
FROM transaction_sales_order so
JOIN masterdata_customer c ON c.id = so.customer_id
JOIN transaction_sales_order_detail sod ON sod.sales_order_id = so.id
WHERE so.status NOT IN ('rejected')
  AND sod.quantity > sod.quantity_delivered
GROUP BY so.id, so.document_number, c.company_name, so.document_date, so.status

UNION ALL

SELECT
    'pending_purchase'::text AS category,
    po.document_number,
    s.company_name AS party_name,
    po.document_date,
    NULL::date AS due_date,
    COALESCE(SUM((pod.quantity - pod.quantity_received) * pod.unit_price), 0) AS amount,
    po.status
FROM transaction_purchase_order po
JOIN masterdata_supplier s ON s.id = po.supplier_id
JOIN transaction_purchase_order_detail pod ON pod.purchase_order_id = po.id
WHERE po.status NOT IN ('rejected')
  AND pod.quantity > pod.quantity_received
GROUP BY po.id, po.document_number, s.company_name, po.document_date, po.status
ORDER BY category, document_date DESC;

CREATE OR REPLACE VIEW report_transaction_tracking AS
SELECT
    q.id AS quotation_id,
    q.document_number AS quotation_number,
    q.document_date AS quotation_date,
    q.grand_total AS quotation_total,
    so.id AS sales_order_id,
    so.document_number AS sales_order_number,
    so.document_date AS sales_order_date,
    so.grand_total AS sales_order_total,
    c.company_name AS customer_name,
    d.id AS delivery_id,
    d.document_number AS delivery_number,
    d.document_date AS delivery_date,
    d.status AS delivery_status,
    si.id AS sales_invoice_id,
    si.document_number AS sales_invoice_number,
    si.document_date AS sales_invoice_date,
    si.status AS invoice_status,
    si.grand_total AS sales_invoice_total,
    si.paid_amount AS invoice_paid_amount,
    si.outstanding_amount AS invoice_outstanding_amount,
    cr.id AS customer_receipt_id,
    cr.document_number AS customer_receipt_number,
    cr.document_date AS customer_receipt_date,
    cr.status AS receipt_status,
    cr.total_amount AS customer_receipt_total
FROM transaction_sales_order so
LEFT JOIN transaction_quotation q ON q.id = so.quotation_id
JOIN masterdata_customer c ON c.id = so.customer_id
LEFT JOIN transaction_delivery d ON d.sales_order_id = so.id
LEFT JOIN transaction_sales_invoice si ON si.delivery_id = d.id
LEFT JOIN LATERAL (
    SELECT cr2.id, cr2.document_number, cr2.document_date, cr2.status, cr2.total_amount
    FROM transaction_customer_receipt_detail crd
    JOIN transaction_customer_receipt cr2 ON cr2.id = crd.customer_receipt_id
    WHERE crd.sales_invoice_id = si.id
    ORDER BY cr2.id DESC
    LIMIT 1
) cr ON TRUE
ORDER BY so.id DESC, d.id DESC, si.id DESC;

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
    d.total_cost,
    u.name AS uom_name
FROM inventory_stock_movement m
JOIN inventory_stock_movement_detail d ON d.movement_id = m.id
JOIN masterdata_product p ON p.id = d.product_id
JOIN masterdata_warehouse w ON w.id = m.warehouse_id
JOIN masterdata_uom u ON u.id = p.base_uom_id
WHERE m.status = 'completed';

CREATE OR REPLACE VIEW report_inventory_valuation AS
SELECT
    p.id AS product_id,
    p.product_code,
    p.name AS product_name,
    c.name AS category_name,
    u.name AS uom_name,
    COALESCE(SUM(sb.quantity_on_hand), 0) AS stock,
    CASE
        WHEN COALESCE(SUM(sb.quantity_on_hand), 0) > 0 THEN
            COALESCE(SUM(sb.quantity_on_hand * COALESCE(NULLIF(sb.average_cost, 0), p.cost_price, 0)), 0)
            / SUM(sb.quantity_on_hand)
        ELSE p.cost_price
    END AS unit_cost,
    COALESCE(SUM(sb.quantity_on_hand * COALESCE(NULLIF(sb.average_cost, 0), p.cost_price, 0)), 0) AS inventory_value
FROM masterdata_product p
LEFT JOIN inventory_stock_balance sb ON sb.product_id = p.id
LEFT JOIN masterdata_product_category c ON c.id = p.category_id
LEFT JOIN masterdata_uom u ON u.id = p.base_uom_id
WHERE p.item_type = 'goods'
GROUP BY p.id, p.product_code, p.name, c.name, u.name, p.cost_price
ORDER BY inventory_value DESC;
