-- DEMO OBJECT: VIEW view_tong_hop_ton_kho
-- Expected on clean sample:
-- - san_pham 9701 in kho 9101 has tong_so_luong = 120
-- - san_pham 9701 tong_gia_tri_ton_kho = 54000000.00
-- - san_pham 9702 in kho 9101 has tong_so_luong = 75
-- - san_pham 9702 tong_gia_tri_ton_kho = 9000000.00

USE warehouse_db;

SELECT *
FROM view_tong_hop_ton_kho
ORDER BY tong_gia_tri_ton_kho DESC, ma_kho, ma_san_pham;


