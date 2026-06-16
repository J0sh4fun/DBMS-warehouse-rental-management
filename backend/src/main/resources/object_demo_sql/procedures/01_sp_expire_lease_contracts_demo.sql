-- DEMO OBJECT: PROCEDURE procedure_cap_nhat_hop_dong_thue_het_han
-- Expected on clean sample:
-- - so_hop_dong_het_han = 0
-- Why:
-- - contract 9201 is still Active and not expired yet
-- - contract 9202 is already Expired
-- This is still a correct result.

USE warehouse_db;

SELECT
  ma_hop_dong,
  trang_thai,
  ngay_bat_dau,
  ngay_ket_thuc,
  CASE
    WHEN ngay_ket_thuc < CURDATE()
     AND trang_thai IN ('Pending', 'Active')
    THEN 'will be updated by procedure'
    ELSE 'not affected'
  END AS procedure_effect
FROM hop_dong_thue
ORDER BY ma_hop_dong;

CALL procedure_cap_nhat_hop_dong_thue_het_han();


