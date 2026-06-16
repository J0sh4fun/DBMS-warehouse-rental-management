-- DEMO OBJECT: TRIGGER trigger_kiem_tra_ct_phieu_xuat_truoc_khi_them
-- Expected result:
-- - The INSERT fails
-- - Expected error message: So lo phieu xuat khong duoc de trong
-- - If you fix so_lo, so_luong and gia_ban are checked next

USE warehouse_db;

INSERT INTO chi_tiet_phieu_xuat (
  ma_phieu_xuat, ma_san_pham, so_lo, so_luong, gia_ban
) VALUES (
  9902, 9702, '   ', 0, -1
);



