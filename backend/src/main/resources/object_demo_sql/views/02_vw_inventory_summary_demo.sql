-- DEMO OBJECT: VIEW vw_inventory_summary
-- Expected on clean sample:
-- - Product 9701 in warehouse 9101 has total_quantity = 120
-- - Product 9701 total_inventory_value = 54000000.00
-- - Product 9702 in warehouse 9101 has total_quantity = 75
-- - Product 9702 total_inventory_value = 9000000.00

USE warehouse_db;

SELECT *
FROM vw_inventory_summary
ORDER BY total_inventory_value DESC, warehouse_id, product_id;
