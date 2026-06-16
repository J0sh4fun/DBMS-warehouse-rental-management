-- DEMO OBJECT: FUNCTION function_gia_tri_ton_kho_theo_lo
-- Expected on clean sample:
-- - gia_tri_ham = 54000000.00
-- - gia_tri_tu_tinh must match gia_tri_ham

USE warehouse_db;

SELECT function_gia_tri_ton_kho_theo_lo(9101, 9701, 'SPK-A-2026') AS gia_tri_ham;

SELECT i.so_luong * p.gia_hien_tai AS gia_tri_tu_tinh
FROM ton_kho i
JOIN san_pham p ON p.ma_san_pham = i.ma_san_pham
WHERE i.ma_kho = 9101
  AND i.ma_san_pham = 9701
  AND i.so_lo = 'SPK-A-2026';


