-- DEMO OBJECT: FUNCTION function_gia_tri_ton_kho_cua_khach_hang
-- Expected on clean sample:
-- - customer1 total ton_kho value = 63000000.00
-- - gia_tri_ham must match gia_tri_tu_tinh

USE warehouse_db;

SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

SELECT function_gia_tri_ton_kho_cua_khach_hang(@ma_khach_hang) AS gia_tri_ham;

SELECT COALESCE(SUM(i.so_luong * p.gia_hien_tai), 0) AS gia_tri_tu_tinh
FROM ton_kho i
JOIN san_pham p ON p.ma_san_pham = i.ma_san_pham
WHERE p.ma_khach_hang = @ma_khach_hang
  AND p.da_xoa = FALSE;


