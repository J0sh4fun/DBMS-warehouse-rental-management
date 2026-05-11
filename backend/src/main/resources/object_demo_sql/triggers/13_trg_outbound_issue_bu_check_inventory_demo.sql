-- DEMO OBJECT: TRIGGER trg_outbound_issue_bu_check_inventory
-- Expected result:
-- - The final UPDATE to Completed fails
-- - Expected error message: Insufficient inventory to complete outbound issue
-- Important:
-- - This script starts a transaction first
-- - If your SQL client stops on the expected error, run ROLLBACK manually in the same session
-- - sample_data.sql should still keep issue 9902 in Draft

USE warehouse_db;

START TRANSACTION;

UPDATE outbound_issue_detail
SET quantity = 100000
WHERE issue_id = 9902
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';

UPDATE outbound_issue
SET status = 'Completed'
WHERE issue_id = 9902;

ROLLBACK;
