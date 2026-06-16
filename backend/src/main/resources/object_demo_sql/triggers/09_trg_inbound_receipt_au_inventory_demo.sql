-- DEMO OBJECT: TRIGGER trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_nhap
-- Safe demo script: changes are rolled back at the end.
-- Expected result inside the transaction:
-- - receipt 9802 changes from Draft to Completed
-- - ton_kho batch SPK-DRAFT-2026 goes from 0 to 20
-- Assumption:
-- - sample_data.sql still keeps receipt 9802 in Draft before you run this script

USE warehouse_db;

START TRANSACTION;

SELECT ma_phieu_nhap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT COALESCE((
  SELECT so_luong
  FROM ton_kho
  WHERE ma_kho = 9101
    AND ma_san_pham = 9701
    AND so_lo = 'SPK-DRAFT-2026'
), 0) AS draft_batch_qty_before;

UPDATE phieu_nhap
SET trang_thai = 'Completed'
WHERE ma_phieu_nhap = 9802;

SELECT ma_phieu_nhap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT COALESCE((
  SELECT so_luong
  FROM ton_kho
  WHERE ma_kho = 9101
    AND ma_san_pham = 9701
    AND so_lo = 'SPK-DRAFT-2026'
), 0) AS draft_batch_qty_after;

ROLLBACK;


