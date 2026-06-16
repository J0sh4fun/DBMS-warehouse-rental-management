-- DEMO OBJECT: TRIGGER trigger_kiem_tra_hop_dong_thue_truoc_khi_them
-- Expected result:
-- - The INSERT fails
-- - Expected error message: Ngay ket thuc hop dong phai lon hon hoac bang ngay bat dau

USE warehouse_db;

INSERT INTO hop_dong_thue (
  ma_hop_dong, ma_khach_hang, ma_kho, ngay_bat_dau, ngay_ket_thuc,
  gia_thue, trang_thai, muc_dich, tao_luc
) VALUES (
  99901,
  (SELECT ma_khach_hang FROM khach_hang ORDER BY ma_khach_hang LIMIT 1),
  9101,
  '2026-12-31',
  '2026-01-01',
  12000000,
  'Active',
  'Trigger demo',
  NOW()
);


