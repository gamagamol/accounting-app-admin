-- Demo seed data for transaction and report verification.
-- This migration only fills existing master data; it does not change schema.

UPDATE masterdata_product
SET selling_price = CASE product_code
        WHEN 'SKS46' THEN 150000.00
        WHEN 'SKS4'  THEN 200000.00
        WHEN 'SK45C' THEN 175000.00
        ELSE selling_price
    END,
    cost_price = CASE product_code
        WHEN 'SKS46' THEN 100000.00
        WHEN 'SKS4'  THEN 130000.00
        WHEN 'SK45C' THEN 115000.00
        ELSE cost_price
    END,
    updated_at = now()
WHERE product_code IN ('SKS46', 'SKS4', 'SK45C');

-- Opening stock so a sales-first trading flow can be tested before purchasing.
INSERT INTO inventory_stock_balance
    (product_id, warehouse_id, quantity_on_hand, quantity_reserved, average_cost, last_movement_at)
SELECT p.id, w.id, 100, 0, p.cost_price, now()
FROM masterdata_product p
CROSS JOIN masterdata_warehouse w
WHERE p.status = 'active'
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

UPDATE masterdata_bank_account
SET current_balance = 1000000000.00,
    updated_at = now()
WHERE code = 'BCA';
