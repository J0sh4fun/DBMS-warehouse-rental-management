-- DEMO OBJECT: TRIGGER trigger_kiem_tra_kho_truoc_khi_cap_nhat
-- Expected result:
-- - The UPDATE fails
-- - Expected error message: kho name is required

USE warehouse_db;

UPDATE kho
SET ten_kho = '   '
WHERE ma_kho = 9101;


