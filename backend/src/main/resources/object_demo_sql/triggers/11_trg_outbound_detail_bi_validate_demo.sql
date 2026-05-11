-- DEMO OBJECT: TRIGGER trg_outbound_detail_bi_validate
-- Expected result:
-- - The INSERT fails
-- - Expected error message: Outbound batch number is required
-- - If you fix batch_no, quantity and selling_price are checked next

USE warehouse_db;

INSERT INTO outbound_issue_detail (
  issue_id, product_id, batch_no, quantity, selling_price
) VALUES (
  9902, 9702, '   ', 0, -1
);
