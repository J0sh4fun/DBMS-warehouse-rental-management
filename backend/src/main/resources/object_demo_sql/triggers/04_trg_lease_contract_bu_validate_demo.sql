-- DEMO OBJECT: TRIGGER trg_lease_contract_bu_validate
-- Safe demo script: changes are rolled back at the end.
-- Expected result inside the transaction:
-- - contract 9201 status becomes Expired automatically
-- - This shows the trigger auto-fixes Pending/Active contracts that are already past end_date

USE warehouse_db;

START TRANSACTION;

UPDATE lease_contract
SET status = 'Active',
    end_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
WHERE contract_id = 9201;

SELECT contract_id, status, start_date, end_date
FROM lease_contract
WHERE contract_id = 9201;

ROLLBACK;
