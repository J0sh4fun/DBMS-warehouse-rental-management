-- DEMO OBJECT: TRIGGER trg_outbound_issue_au_inventory
-- Safe demo script: changes are rolled back at the end.
-- Expected result inside the transaction:
-- - issue 9902 changes from Draft to Completed
-- - inventory quantity of BUTTER-APR26 goes from 75 to 65
-- Assumption:
-- - sample_data.sql still keeps issue 9902 in Draft before you run this script

USE warehouse_db;

START TRANSACTION;

SELECT issue_id, status
FROM outbound_issue
WHERE issue_id = 9902;

SELECT COALESCE((
  SELECT quantity
  FROM inventory
  WHERE warehouse_id = 9101
    AND product_id = 9702
    AND batch_no = 'BUTTER-APR26'
), 0) AS butter_qty_before;

UPDATE outbound_issue
SET status = 'Completed'
WHERE issue_id = 9902;

SELECT issue_id, status
FROM outbound_issue
WHERE issue_id = 9902;

SELECT COALESCE((
  SELECT quantity
  FROM inventory
  WHERE warehouse_id = 9101
    AND product_id = 9702
    AND batch_no = 'BUTTER-APR26'
), 0) AS butter_qty_after;

ROLLBACK;
