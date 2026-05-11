-- DEMO OBJECT: PROCEDURE sp_get_customer_inventory_value
-- Expected on clean sample:
-- - @customer_id resolves to customer1@gmail.com
-- - total_inventory_value should be 63000000.00

USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_customer_inventory_value(@customer_id);
