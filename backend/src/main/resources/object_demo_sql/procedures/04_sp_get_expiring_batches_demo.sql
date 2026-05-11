-- DEMO OBJECT: PROCEDURE sp_get_expiring_batches
-- Expected on clean sample:
-- - At least batch BUTTER-APR26 should appear
-- - customer_id should belong to customer1@gmail.com
-- - days_until_expiry should be between 0 and 180

USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_expiring_batches(@customer_id, 180);
