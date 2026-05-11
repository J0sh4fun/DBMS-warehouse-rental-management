-- DEMO OBJECT: PROCEDURE sp_get_top_exported_products
-- Expected on clean sample:
-- - 1 row for product 9701
-- - total_quantity_exported = 30
-- - total_revenue = 15600000.00

USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_top_exported_products(@customer_id, 2026, 4, 5);
