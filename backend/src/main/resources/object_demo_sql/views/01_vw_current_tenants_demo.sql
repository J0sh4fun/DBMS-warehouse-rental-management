-- DEMO OBJECT: VIEW vw_current_tenants
-- Expected on clean sample:
-- - 1 row for customer1@gmail.com
-- - warehouse_id = 9101
-- - contract status is Active and still valid on CURDATE()

USE warehouse_db;

SELECT *
FROM vw_current_tenants
ORDER BY end_date, customer_name, warehouse_name;
