-- DEMO OBJECT: PROCEDURE sp_get_current_tenants_by_admin
-- Expected on clean sample:
-- - @admin_id resolves to admin1@gmail.com
-- - 1 row should be returned for warehouse 9101 and customer1@gmail.com

USE warehouse_db;

SET @admin_id = (
  SELECT admin_id
  FROM admin
  WHERE user_name = 'admin1@gmail.com'
  LIMIT 1
);

CALL sp_get_current_tenants_by_admin(@admin_id);
