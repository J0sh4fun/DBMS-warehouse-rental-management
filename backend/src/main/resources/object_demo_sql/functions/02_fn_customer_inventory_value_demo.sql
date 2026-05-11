-- DEMO OBJECT: FUNCTION fn_customer_inventory_value
-- Expected on clean sample:
-- - customer1 total inventory value = 63000000.00
-- - fn_value must match manual_value

USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

SELECT fn_customer_inventory_value(@customer_id) AS fn_value;

SELECT COALESCE(SUM(i.quantity * p.current_price), 0) AS manual_value
FROM inventory i
JOIN product p ON p.product_id = i.product_id
WHERE p.customer_id = @customer_id
  AND p.is_deleted = FALSE;
