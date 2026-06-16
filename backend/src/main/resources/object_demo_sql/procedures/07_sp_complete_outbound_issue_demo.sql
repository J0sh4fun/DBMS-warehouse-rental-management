-- DEMO OBJECT: PROCEDURE procedure_hoan_tat_phieu_xuat
-- Safe demo script: changes are rolled back at the end.
-- Expected inside the transaction:
-- - issue 9902 becomes Completed
-- - ton_kho so_luong of BUTTER-APR26 goes from 75 to 65
-- Assumption:
-- - sample_data.sql still keeps issue 9902 in Draft before you run this script

USE warehouse_db;

START TRANSACTION;

SELECT ma_phieu_xuat, trang_thai
FROM phieu_xuat
WHERE ma_phieu_xuat = 9902;

SELECT COALESCE((
  SELECT so_luong
  FROM ton_kho
  WHERE ma_kho = 9101
    AND ma_san_pham = 9702
    AND so_lo = 'BUTTER-APR26'
), 0) AS butter_qty_before;

CALL procedure_hoan_tat_phieu_xuat(9902);

SELECT ma_phieu_xuat, trang_thai
FROM phieu_xuat
WHERE ma_phieu_xuat = 9902;

SELECT COALESCE((
  SELECT so_luong
  FROM ton_kho
  WHERE ma_kho = 9101
    AND ma_san_pham = 9702
    AND so_lo = 'BUTTER-APR26'
), 0) AS butter_qty_after;

ROLLBACK;


