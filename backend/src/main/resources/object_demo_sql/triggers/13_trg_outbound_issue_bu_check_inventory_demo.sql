-- DEMO OBJECT: TRIGGER trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_phieu_xuat
-- Expected result:
-- - The final UPDATE to Completed fails
-- - Expected error message: Insufficient ton_kho to complete outbound issue
-- Important:
-- - This script starts a transaction first
-- - If your SQL client stops on the expected error, run ROLLBACK manually in the same session
-- - sample_data.sql should still keep issue 9902 in Draft

USE warehouse_db;

START TRANSACTION;

UPDATE chi_tiet_phieu_xuat
SET so_luong = 100000
WHERE ma_phieu_xuat = 9902
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';

UPDATE phieu_xuat
SET trang_thai = 'Completed'
WHERE ma_phieu_xuat = 9902;

ROLLBACK;




