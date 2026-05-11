-- DEMO OBJECT: VIEW vw_expiring_batches
-- Expected on clean sample:
-- - Should include batch BUTTER-APR26
-- - current_quantity should be 75
-- - expiry_date should be 2026-09-30
-- - days_until_expiry changes with current date, so check that it is non-negative

USE warehouse_db;

SELECT *
FROM vw_expiring_batches
ORDER BY expiry_date, product_name, batch_no;
