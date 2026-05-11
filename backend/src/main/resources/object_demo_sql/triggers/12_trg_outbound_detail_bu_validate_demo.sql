-- DEMO OBJECT: TRIGGER trg_outbound_detail_bu_validate
-- Expected result:
-- - The UPDATE fails
-- - Expected error message: Outbound selling price cannot be negative

USE warehouse_db;

UPDATE outbound_issue_detail
SET selling_price = -1
WHERE issue_id = 9902
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';
