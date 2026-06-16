-- DEMO OBJECT: PROCEDURE procedure_lay_gia_tri_ton_kho_khach_hang
-- Expected on clean sample:
-- - @ma_khach_hang resolves to customer1@gmail.com
-- - tong_gia_tri_ton_kho should be 63000000.00

USE warehouse_db;

SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_gia_tri_ton_kho_khach_hang(@ma_khach_hang);


