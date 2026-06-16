-- DEMO OBJECT: PROCEDURE procedure_lay_lo_hang_sap_het_han
-- Expected on clean sample:
-- - At least batch BUTTER-APR26 should appear
-- - ma_khach_hang should belong to customer1@gmail.com
-- - so_ngay_con_lai should be between 0 and 180

USE warehouse_db;

SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_lo_hang_sap_het_han(@ma_khach_hang, 180);


