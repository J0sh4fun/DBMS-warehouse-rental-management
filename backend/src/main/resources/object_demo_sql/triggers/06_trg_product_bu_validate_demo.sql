-- DEMO OBJECT: TRIGGER trg_product_bu_validate
-- Expected result:
-- - The UPDATE fails
-- - Expected error message: Product current price cannot be negative

USE warehouse_db;

UPDATE product
SET current_price = -1
WHERE product_id = 9701;
