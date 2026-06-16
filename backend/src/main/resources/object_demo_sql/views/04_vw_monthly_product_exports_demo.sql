-- DEMO OBJECT: VIEW view_xuat_hang_theo_thang
-- Expected on clean sample:
-- - For April 2026, san_pham 9701 should appear
-- - tong_so_luong_xuat = 30
-- - tong_doanh_thu = 15600000.00
-- - Only Completed outbound issues are counted

USE warehouse_db;

SELECT *
FROM view_xuat_hang_theo_thang
WHERE nam_xuat = 2026
  AND thang_xuat = 4
ORDER BY tong_so_luong_xuat DESC, tong_doanh_thu DESC;


