-- DEMO OBJECT: VIEW view_lo_hang_sap_het_han
-- Expected on clean sample:
-- - Should include batch BUTTER-APR26
-- - so_luong_hien_tai should be 75
-- - han_su_dung should be 2026-09-30
-- - so_ngay_con_lai changes with current date, so check that it is non-negative

USE warehouse_db;

SELECT *
FROM view_lo_hang_sap_het_han
ORDER BY han_su_dung, ten_san_pham, so_lo;


