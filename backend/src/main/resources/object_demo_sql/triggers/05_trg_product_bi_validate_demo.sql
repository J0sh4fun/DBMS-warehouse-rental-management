-- DEMO OBJECT: TRIGGER trg_product_bi_validate
-- Expected result:
-- - The INSERT fails
-- - Expected error message: Product name is required
-- - If you fix the name, unit_of_measure and current_price are checked next

USE warehouse_db;

INSERT INTO product (
  product_id, product_name, current_price, unit_of_measure,
  customer_id, category_id, is_deleted
) VALUES (
  99901, '   ', -1, '   ',
  (SELECT customer_id FROM customer WHERE user_name = 'customer1@gmail.com' LIMIT 1),
  9401,
  FALSE
);
