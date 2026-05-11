-- DEMO OBJECT: FUNCTION fn_inventory_batch_value
-- Expected on clean sample:
-- - fn_value = 54000000.00
-- - manual_value must match fn_value

USE warehouse_db;

SELECT fn_inventory_batch_value(9101, 9701, 'SPK-A-2026') AS fn_value;

SELECT i.quantity * p.current_price AS manual_value
FROM inventory i
JOIN product p ON p.product_id = i.product_id
WHERE i.warehouse_id = 9101
  AND i.product_id = 9701
  AND i.batch_no = 'SPK-A-2026';
