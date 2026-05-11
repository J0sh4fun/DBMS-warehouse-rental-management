-- DEMO OBJECT: PROCEDURE sp_complete_inbound_receipt
-- Safe demo script: changes are rolled back at the end.
-- Expected inside the transaction:
-- - receipt 9802 becomes Completed
-- - inventory batch SPK-DRAFT-2026 appears with quantity 20
-- Assumption:
-- - sample_data.sql still keeps receipt 9802 in Draft before you run this script

USE warehouse_db;

START TRANSACTION;

SELECT receipt_id, status
FROM inbound_receipt
WHERE receipt_id = 9802;

SELECT COALESCE((
  SELECT quantity
  FROM inventory
  WHERE warehouse_id = 9101
    AND product_id = 9701
    AND batch_no = 'SPK-DRAFT-2026'
), 0) AS draft_batch_qty_before;

CALL sp_complete_inbound_receipt(9802);

SELECT receipt_id, status
FROM inbound_receipt
WHERE receipt_id = 9802;

SELECT COALESCE((
  SELECT quantity
  FROM inventory
  WHERE warehouse_id = 9101
    AND product_id = 9701
    AND batch_no = 'SPK-DRAFT-2026'
), 0) AS draft_batch_qty_after;

ROLLBACK;
