-- DEMO OBJECT: FUNCTION function_ton_kho_kha_dung
-- Expected on clean sample:
-- - BUTTER-APR26 available so_luong = 75
-- - so_luong_ham must match so_luong_tu_tinh

USE warehouse_db;

SELECT function_ton_kho_kha_dung(9101, 9702, 'BUTTER-APR26') AS so_luong_ham;

SELECT COALESCE(so_luong, 0) AS so_luong_tu_tinh
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';


