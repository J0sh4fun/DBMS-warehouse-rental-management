-- DEMO OBJECT: VIEW vw_monthly_product_exports
-- Expected on clean sample:
-- - For April 2026, product 9701 should appear
-- - total_quantity_exported = 30
-- - total_revenue = 15600000.00
-- - Only Completed outbound issues are counted

USE warehouse_db;

SELECT *
FROM vw_monthly_product_exports
WHERE export_year = 2026
  AND export_month = 4
ORDER BY total_quantity_exported DESC, total_revenue DESC;
