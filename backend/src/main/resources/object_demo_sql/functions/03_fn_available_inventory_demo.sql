-- DEMO OBJECT: FUNCTION fn_available_inventory
-- Expected on clean sample:
-- - BUTTER-APR26 available quantity = 75
-- - fn_qty must match manual_qty

USE warehouse_db;

SELECT fn_available_inventory(9101, 9702, 'BUTTER-APR26') AS fn_qty;

SELECT COALESCE(quantity, 0) AS manual_qty
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';
