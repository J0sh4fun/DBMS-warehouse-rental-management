-- DEMO OBJECT: TRIGGER trg_inbound_detail_bi_validate
-- Expected result:
-- - The INSERT fails
-- - Expected error message: Inbound batch number is required
-- - If you fix batch_no, quantity and import_price are checked next

USE warehouse_db;

INSERT INTO inbound_receipt_detail (
  receipt_id, product_id, batch_no, quantity, import_price, expiry_date
) VALUES (
  9802, 9701, '   ', 0, -1, NULL
);
