-- DEMO OBJECT: TRIGGER trigger_kiem_tra_san_pham_truoc_khi_cap_nhat
-- Expected result:
-- - The UPDATE fails
-- - Expected error message: san_pham current price cannot be negative

USE warehouse_db;

UPDATE san_pham
SET gia_hien_tai = -1
WHERE ma_san_pham = 9701;


