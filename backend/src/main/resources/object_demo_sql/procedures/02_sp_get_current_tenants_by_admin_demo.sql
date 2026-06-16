-- DEMO OBJECT: PROCEDURE procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien
-- Expected on clean sample:
-- - @ma_quan_tri_vien resolves to admin1@gmail.com
-- - 1 row should be returned for kho 9101 and customer1@gmail.com

USE warehouse_db;

SET @ma_quan_tri_vien = (
  SELECT ma_quan_tri_vien
  FROM quan_tri_vien
  WHERE ten_dang_nhap = 'admin1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien(@ma_quan_tri_vien);


