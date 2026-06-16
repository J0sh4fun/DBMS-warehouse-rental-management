-- DEMO OBJECT: TRIGGER trigger_kiem_tra_ct_phieu_xuat_truoc_khi_cap_nhat
-- Expected result:
-- - The UPDATE fails
-- - Expected error message: Gia ban khong duoc am

USE warehouse_db;

UPDATE chi_tiet_phieu_xuat
SET gia_ban = -1
WHERE ma_phieu_xuat = 9902
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';



