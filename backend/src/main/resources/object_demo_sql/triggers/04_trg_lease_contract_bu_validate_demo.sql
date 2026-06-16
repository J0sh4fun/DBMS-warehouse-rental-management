-- DEMO OBJECT: TRIGGER trigger_kiem_tra_hop_dong_thue_truoc_khi_cap_nhat
-- Safe demo script: changes are rolled back at the end.
-- Expected result inside the transaction:
-- - contract 9201 trang_thai becomes Expired automatically
-- - This shows the trigger auto-fixes Pending/Active contracts that are already past ngay_ket_thuc

USE warehouse_db;

START TRANSACTION;

UPDATE hop_dong_thue
SET trang_thai = 'Active',
    ngay_ket_thuc = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
WHERE ma_hop_dong = 9201;

SELECT ma_hop_dong, trang_thai, ngay_bat_dau, ngay_ket_thuc
FROM hop_dong_thue
WHERE ma_hop_dong = 9201;

ROLLBACK;


