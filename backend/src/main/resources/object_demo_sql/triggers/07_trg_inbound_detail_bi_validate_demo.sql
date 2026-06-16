-- DEMO OBJECT: TRIGGER trigger_kiem_tra_ct_phieu_nhap_truoc_khi_them
-- Expected result:
-- - The INSERT fails
-- - Expected error message: So lo phieu nhap khong duoc de trong
-- - If you fix so_lo, so_luong and gia_nhap are checked next

USE warehouse_db;

INSERT INTO chi_tiet_phieu_nhap (
  ma_phieu_nhap, ma_san_pham, so_lo, so_luong, gia_nhap, han_su_dung
) VALUES (
  9802, 9701, '   ', 0, -1, NULL
);


