-- DEMO OBJECT: TRIGGER trg_warehouse_bu_validate
-- Expected result:
-- - The UPDATE fails
-- - Expected error message: Warehouse name is required

USE warehouse_db;

UPDATE warehouse
SET warehouse_name = '   '
WHERE warehouse_id = 9101;
