-- DEMO OBJECT: VIEW view_khach_thue_hien_tai
-- Expected on clean sample:
-- - 1 row for customer1@gmail.com
-- - ma_kho = 9101
-- - contract trang_thai is Active and still valid on CURDATE()

USE warehouse_db;

SELECT *
FROM view_khach_thue_hien_tai
ORDER BY ngay_ket_thuc, ten_khach_hang, ten_kho;



