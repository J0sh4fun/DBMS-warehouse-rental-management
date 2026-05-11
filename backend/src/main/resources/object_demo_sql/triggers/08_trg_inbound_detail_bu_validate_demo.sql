-- DEMO OBJECT: TRIGGER trg_inbound_detail_bu_validate
-- Expected result:
-- - The UPDATE fails
-- - Expected error message: Inbound quantity must be greater than zero

USE warehouse_db;

UPDATE inbound_receipt_detail
SET quantity = 0
WHERE receipt_id = 9802
  AND product_id = 9701
  AND batch_no = 'SPK-DRAFT-2026';
