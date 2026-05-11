-- DEMO OBJECT: PROCEDURE sp_expire_lease_contracts
-- Expected on clean sample:
-- - expired_contracts = 0
-- Why:
-- - contract 9201 is still Active and not expired yet
-- - contract 9202 is already Expired
-- This is still a correct result.

USE warehouse_db;

SELECT
  contract_id,
  status,
  start_date,
  end_date,
  CASE
    WHEN end_date < CURDATE()
     AND status IN ('Pending', 'Active')
    THEN 'will be updated by procedure'
    ELSE 'not affected'
  END AS procedure_effect
FROM lease_contract
ORDER BY contract_id;

CALL sp_expire_lease_contracts();
