-- DEMO OBJECT: TRIGGER trg_warehouse_bi_validate
-- Expected result:
-- - The INSERT fails
-- - Expected error message: Warehouse name is required
-- - If you change the name to a valid one, area = -10 should then fail next

USE warehouse_db;

INSERT INTO warehouse (
  warehouse_id, warehouse_name, address, area, rental_price, status, admin_id
) VALUES (
  99901, '   ', 'Trigger demo address', -10, 1000000, 'Active',
  (SELECT admin_id FROM admin ORDER BY admin_id LIMIT 1)
);
