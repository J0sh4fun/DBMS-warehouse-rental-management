-- DEMO OBJECT: TRIGGER trg_lease_contract_bi_validate
-- Expected result:
-- - The INSERT fails
-- - Expected error message: Lease contract end date must be on or after start date

USE warehouse_db;

INSERT INTO lease_contract (
  contract_id, customer_id, warehouse_id, start_date, end_date,
  rental_price, status, purpose, created_at
) VALUES (
  99901,
  (SELECT customer_id FROM customer ORDER BY customer_id LIMIT 1),
  9101,
  '2026-12-31',
  '2026-01-01',
  12000000,
  'Active',
  'Trigger demo',
  NOW()
);
