-- DEMO OBJECT: TRIGGER trigger_kiem_tra_kho_truoc_khi_them
-- Expected result:
-- - The INSERT fails
-- - Expected error message: kho name is required
-- - If you change the name to a valid one, dien_tich = -10 should then fail next

USE warehouse_db;

INSERT INTO kho (
  ma_kho, ten_kho, dia_chi, dien_tich, gia_thue, trang_thai, ma_quan_tri_vien
) VALUES (
  99901, '   ', 'Trigger demo dia_chi', -10, 1000000, 'Active',
  (SELECT ma_quan_tri_vien FROM quan_tri_vien ORDER BY ma_quan_tri_vien LIMIT 1)
);


