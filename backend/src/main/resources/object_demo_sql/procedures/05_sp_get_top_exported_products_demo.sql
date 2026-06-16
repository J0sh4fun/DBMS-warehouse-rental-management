-- DEMO OBJECT: PROCEDURE procedure_lay_san_pham_xuat_nhieu_nhat
-- Expected on clean sample:
-- - 1 row for san_pham 9701
-- - tong_so_luong_xuat = 30
-- - tong_doanh_thu = 15600000.00

USE warehouse_db;

SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_san_pham_xuat_nhieu_nhat(@ma_khach_hang, 2026, 4, 5);


