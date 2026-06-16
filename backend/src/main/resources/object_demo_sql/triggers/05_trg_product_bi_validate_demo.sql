-- DEMO OBJECT: TRIGGER trigger_kiem_tra_san_pham_truoc_khi_them
-- Expected result:
-- - The INSERT fails
-- - Expected error message: san_pham name is required
-- - If you fix the name, don_vi_tinh and gia_hien_tai are checked next

USE warehouse_db;

INSERT INTO san_pham (
  ma_san_pham, ten_san_pham, gia_hien_tai, don_vi_tinh,
  ma_khach_hang, ma_danh_muc, da_xoa
) VALUES (
  99901, '   ', -1, '   ',
  (SELECT ma_khach_hang FROM khach_hang WHERE ten_dang_nhap = 'customer1@gmail.com' LIMIT 1),
  9401,
  FALSE
);


