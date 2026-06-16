-- DEMO OBJECT: TRIGGER trigger_kiem_tra_ct_phieu_nhap_truoc_khi_cap_nhat
-- Expected result:
-- - The UPDATE fails
-- - Expected error message: So luong phieu nhap phai lon hon 0

USE warehouse_db;

UPDATE chi_tiet_phieu_nhap
SET so_luong = 0
WHERE ma_phieu_nhap = 9802
  AND ma_san_pham = 9701
  AND so_lo = 'SPK-DRAFT-2026';


