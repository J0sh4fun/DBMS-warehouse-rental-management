-- Cac doi tuong DBMS bo sung cho luoc do MySQL do Hibernate tao ra.
-- Script nay demo day du luoc_nhin, ham, thu_tuc va kich_hoat tu dong cong/tru ton_kho.
-- Khong chay cung luc voi luong Java neu Java van tu cap nhat ton_kho, neu khong du lieu co the bi cap nhat hai lan.
-- Script nay khong xoa va khong tao lai cac bang du lieu.

SET NAMES utf8mb4;

DROP TRIGGER IF EXISTS `trigger_kiem_tra_kho_truoc_khi_them`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_kho_truoc_khi_cap_nhat`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_hop_dong_thue_truoc_khi_them`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_hop_dong_thue_truoc_khi_cap_nhat`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_san_pham_truoc_khi_them`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_san_pham_truoc_khi_cap_nhat`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_ct_phieu_nhap_truoc_khi_them`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_ct_phieu_nhap_truoc_khi_cap_nhat`;
DROP TRIGGER IF EXISTS `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_nhap`;
DROP TRIGGER IF EXISTS `trigger_cap_nhat_ton_kho_sau_khi_them_ct_phieu_nhap`;
DROP TRIGGER IF EXISTS `trigger_cap_nhat_ton_kho_sau_khi_xoa_ct_phieu_nhap`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_ct_phieu_xuat_truoc_khi_them`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_ct_phieu_xuat_truoc_khi_cap_nhat`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_phieu_xuat`;
DROP TRIGGER IF EXISTS `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_xuat`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_ct_phieu_xuat`;
DROP TRIGGER IF EXISTS `trigger_cap_nhat_ton_kho_sau_khi_them_ct_phieu_xuat`;
DROP TRIGGER IF EXISTS `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_ct_phieu_xuat`;
DROP TRIGGER IF EXISTS `trigger_cap_nhat_ton_kho_sau_khi_xoa_ct_phieu_xuat`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_ton_kho_truoc_khi_them`;
DROP TRIGGER IF EXISTS `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat`;

DROP VIEW IF EXISTS `view_khach_thue_hien_tai`;
DROP VIEW IF EXISTS `view_tong_hop_ton_kho`;
DROP VIEW IF EXISTS `view_lo_hang_sap_het_han`;
DROP VIEW IF EXISTS `view_xuat_hang_theo_thang`;

DROP PROCEDURE IF EXISTS `procedure_cap_nhat_hop_dong_thue_het_han`;
DROP PROCEDURE IF EXISTS `procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien`;
DROP PROCEDURE IF EXISTS `procedure_lay_gia_tri_ton_kho_khach_hang`;
DROP PROCEDURE IF EXISTS `procedure_lay_lo_hang_sap_het_han`;
DROP PROCEDURE IF EXISTS `procedure_lay_san_pham_xuat_nhieu_nhat`;
DROP PROCEDURE IF EXISTS `procedure_hoan_tat_phieu_nhap`;
DROP PROCEDURE IF EXISTS `procedure_hoan_tat_phieu_xuat`;

DROP FUNCTION IF EXISTS `function_gia_tri_ton_kho_theo_lo`;
DROP FUNCTION IF EXISTS `function_gia_tri_ton_kho_cua_khach_hang`;
DROP FUNCTION IF EXISTS `function_ton_kho_kha_dung`;

CREATE OR REPLACE VIEW `view_khach_thue_hien_tai` AS
SELECT
  quan_tri_vien.`ma_quan_tri_vien`,
  quan_tri_vien.`ten_quan_tri_vien`,
  khach_hang.`ma_khach_hang`,
  khach_hang.`ten_khach_hang`,
  khach_hang.`ten_dang_nhap` AS `ten_dang_nhap_khach_hang`,
  khach_hang.`email` AS `email_khach_hang`,
  khach_hang.`so_dien_thoai`,
  kho_hang.`ma_kho`,
  kho_hang.`ten_kho`,
  hop_dong_thue.`ma_hop_dong`,
  hop_dong_thue.`ngay_bat_dau`,
  hop_dong_thue.`ngay_ket_thuc`,
  hop_dong_thue.`gia_thue`,
  hop_dong_thue.`trang_thai`
FROM `hop_dong_thue` hop_dong_thue
JOIN `khach_hang` khach_hang
  ON khach_hang.`ma_khach_hang` = hop_dong_thue.`ma_khach_hang`
JOIN `kho` kho_hang
  ON kho_hang.`ma_kho` = hop_dong_thue.`ma_kho`
JOIN `quan_tri_vien` quan_tri_vien
  ON quan_tri_vien.`ma_quan_tri_vien` = kho_hang.`ma_quan_tri_vien`
WHERE hop_dong_thue.`trang_thai` = 'Active'
  AND CURDATE() BETWEEN hop_dong_thue.`ngay_bat_dau` AND hop_dong_thue.`ngay_ket_thuc`;

CREATE OR REPLACE VIEW `view_tong_hop_ton_kho` AS
SELECT
  san_pham.`ma_khach_hang`,
  khach_hang.`ten_khach_hang`,
  ton_kho.`ma_kho`,
  kho_hang.`ten_kho`,
  ton_kho.`ma_san_pham`,
  san_pham.`ten_san_pham`,
  san_pham.`don_vi_tinh`,
  san_pham.`ma_danh_muc`,
  danh_muc.`ten_danh_muc`,
  SUM(ton_kho.`so_luong`) AS `tong_so_luong`,
  san_pham.`gia_hien_tai`,
  SUM(ton_kho.`so_luong` * san_pham.`gia_hien_tai`) AS `tong_gia_tri_ton_kho`,
  COUNT(*) AS `so_lo_hang`
FROM `ton_kho` ton_kho
JOIN `kho` kho_hang
  ON kho_hang.`ma_kho` = ton_kho.`ma_kho`
JOIN `san_pham` san_pham
  ON san_pham.`ma_san_pham` = ton_kho.`ma_san_pham`
JOIN `khach_hang` khach_hang
  ON khach_hang.`ma_khach_hang` = san_pham.`ma_khach_hang`
JOIN `danh_muc` danh_muc
  ON danh_muc.`ma_danh_muc` = san_pham.`ma_danh_muc`
WHERE san_pham.`da_xoa` = FALSE
  AND danh_muc.`da_xoa` = FALSE
GROUP BY
  san_pham.`ma_khach_hang`,
  khach_hang.`ten_khach_hang`,
  ton_kho.`ma_kho`,
  kho_hang.`ten_kho`,
  ton_kho.`ma_san_pham`,
  san_pham.`ten_san_pham`,
  san_pham.`don_vi_tinh`,
  san_pham.`ma_danh_muc`,
  danh_muc.`ten_danh_muc`,
  san_pham.`gia_hien_tai`;

CREATE OR REPLACE VIEW `view_lo_hang_sap_het_han` AS
SELECT
  san_pham.`ma_khach_hang`,
  khach_hang.`ten_khach_hang`,
  phieu_nhap.`ma_phieu_nhap`,
  phieu_nhap.`ma_kho`,
  kho_hang.`ten_kho`,
  nha_cung_cap.`ma_nha_cung_cap`,
  nha_cung_cap.`ten_nha_cung_cap`,
  chi_tiet_nhap.`ma_san_pham`,
  san_pham.`ten_san_pham`,
  chi_tiet_nhap.`so_lo`,
  ton_kho_hien_co.`so_luong` AS `so_luong_hien_tai`,
  chi_tiet_nhap.`han_su_dung`,
  DATEDIFF(chi_tiet_nhap.`han_su_dung`, CURDATE()) AS `so_ngay_con_lai`,
  ton_kho_hien_co.`so_luong` * san_pham.`gia_hien_tai` AS `gia_tri_ton_kho`
FROM `chi_tiet_phieu_nhap` chi_tiet_nhap
JOIN `phieu_nhap` phieu_nhap
  ON phieu_nhap.`ma_phieu_nhap` = chi_tiet_nhap.`ma_phieu_nhap`
 AND phieu_nhap.`trang_thai` = 'Completed'
JOIN `kho` kho_hang
  ON kho_hang.`ma_kho` = phieu_nhap.`ma_kho`
JOIN `nha_cung_cap` nha_cung_cap
  ON nha_cung_cap.`ma_nha_cung_cap` = phieu_nhap.`ma_nha_cung_cap`
JOIN `san_pham` san_pham
  ON san_pham.`ma_san_pham` = chi_tiet_nhap.`ma_san_pham`
JOIN `khach_hang` khach_hang
  ON khach_hang.`ma_khach_hang` = san_pham.`ma_khach_hang`
JOIN `ton_kho` ton_kho_hien_co
  ON ton_kho_hien_co.`ma_kho` = phieu_nhap.`ma_kho`
 AND ton_kho_hien_co.`ma_san_pham` = chi_tiet_nhap.`ma_san_pham`
 AND ton_kho_hien_co.`so_lo` = chi_tiet_nhap.`so_lo`
WHERE ton_kho_hien_co.`so_luong` > 0
  AND san_pham.`da_xoa` = FALSE
  AND chi_tiet_nhap.`han_su_dung` IS NOT NULL;

CREATE OR REPLACE VIEW `view_xuat_hang_theo_thang` AS
SELECT
  nguoi_mua.`ma_khach_hang`,
  khach_hang.`ten_khach_hang`,
  phieu_xuat.`ma_kho`,
  kho_hang.`ten_kho`,
  chi_tiet_xuat.`ma_san_pham`,
  san_pham.`ten_san_pham`,
  YEAR(phieu_xuat.`ngay_xuat`) AS `nam_xuat`,
  MONTH(phieu_xuat.`ngay_xuat`) AS `thang_xuat`,
  SUM(chi_tiet_xuat.`so_luong`) AS `tong_so_luong_xuat`,
  SUM(chi_tiet_xuat.`so_luong` * chi_tiet_xuat.`gia_ban`) AS `tong_doanh_thu`
FROM `chi_tiet_phieu_xuat` chi_tiet_xuat
JOIN `phieu_xuat` phieu_xuat
  ON phieu_xuat.`ma_phieu_xuat` = chi_tiet_xuat.`ma_phieu_xuat`
JOIN `nguoi_mua` nguoi_mua
  ON nguoi_mua.`ma_nguoi_mua` = phieu_xuat.`ma_nguoi_mua`
JOIN `khach_hang` khach_hang
  ON khach_hang.`ma_khach_hang` = nguoi_mua.`ma_khach_hang`
JOIN `kho` kho_hang
  ON kho_hang.`ma_kho` = phieu_xuat.`ma_kho`
JOIN `san_pham` san_pham
  ON san_pham.`ma_san_pham` = chi_tiet_xuat.`ma_san_pham`
WHERE phieu_xuat.`trang_thai` = 'Completed'
  AND san_pham.`da_xoa` = FALSE
GROUP BY
  nguoi_mua.`ma_khach_hang`,
  khach_hang.`ten_khach_hang`,
  phieu_xuat.`ma_kho`,
  kho_hang.`ten_kho`,
  chi_tiet_xuat.`ma_san_pham`,
  san_pham.`ten_san_pham`,
  YEAR(phieu_xuat.`ngay_xuat`),
  MONTH(phieu_xuat.`ngay_xuat`);

DELIMITER $$

CREATE FUNCTION `function_gia_tri_ton_kho_theo_lo`(
  tham_so_ma_kho INT,
  tham_so_ma_san_pham INT,
  tham_so_so_lo VARCHAR(100)
)
RETURNS DECIMAL(18,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE bien_gia_tri DECIMAL(18,2);

  SELECT COALESCE(SUM(ton_kho.`so_luong` * san_pham.`gia_hien_tai`), 0)
    INTO bien_gia_tri
  FROM `ton_kho` ton_kho
  JOIN `san_pham` san_pham
    ON san_pham.`ma_san_pham` = ton_kho.`ma_san_pham`
  WHERE ton_kho.`ma_kho` = tham_so_ma_kho
    AND ton_kho.`ma_san_pham` = tham_so_ma_san_pham
    AND ton_kho.`so_lo` = tham_so_so_lo
    AND san_pham.`da_xoa` = FALSE;

  RETURN bien_gia_tri;
END$$

CREATE FUNCTION `function_gia_tri_ton_kho_cua_khach_hang`(tham_so_ma_khach_hang INT)
RETURNS DECIMAL(18,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE bien_tong DECIMAL(18,2);

  SELECT COALESCE(SUM(ton_kho.`so_luong` * san_pham.`gia_hien_tai`), 0)
    INTO bien_tong
  FROM `ton_kho` ton_kho
  JOIN `san_pham` san_pham
    ON san_pham.`ma_san_pham` = ton_kho.`ma_san_pham`
  WHERE san_pham.`ma_khach_hang` = tham_so_ma_khach_hang
    AND san_pham.`da_xoa` = FALSE;

  RETURN bien_tong;
END$$

CREATE FUNCTION `function_ton_kho_kha_dung`(
  tham_so_ma_kho INT,
  tham_so_ma_san_pham INT,
  tham_so_so_lo VARCHAR(100)
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE bien_so_luong INT DEFAULT 0;

  SELECT COALESCE(ton_kho.`so_luong`, 0)
    INTO bien_so_luong
  FROM `ton_kho` ton_kho
  WHERE ton_kho.`ma_kho` = tham_so_ma_kho
    AND ton_kho.`ma_san_pham` = tham_so_ma_san_pham
    AND ton_kho.`so_lo` = tham_so_so_lo
  LIMIT 1;

  RETURN COALESCE(bien_so_luong, 0);
END$$

CREATE PROCEDURE `procedure_cap_nhat_hop_dong_thue_het_han`()
BEGIN
  UPDATE `hop_dong_thue`
  SET `trang_thai` = 'Expired'
  WHERE `ngay_ket_thuc` < CURDATE()
    AND `trang_thai` IN ('Pending', 'Active');

  SELECT ROW_COUNT() AS `so_hop_dong_het_han`;
END$$

CREATE PROCEDURE `procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien`(IN tham_so_ma_quan_tri_vien INT)
BEGIN
  SELECT *
  FROM `view_khach_thue_hien_tai`
  WHERE `ma_quan_tri_vien` = tham_so_ma_quan_tri_vien
  ORDER BY `ngay_ket_thuc`, `ten_khach_hang`, `ten_kho`;
END$$

CREATE PROCEDURE `procedure_lay_gia_tri_ton_kho_khach_hang`(IN tham_so_ma_khach_hang INT)
BEGIN
  SELECT
    tham_so_ma_khach_hang AS `ma_khach_hang`,
    function_gia_tri_ton_kho_cua_khach_hang(tham_so_ma_khach_hang) AS `tong_gia_tri_ton_kho`;
END$$

CREATE PROCEDURE `procedure_lay_lo_hang_sap_het_han`(
  IN tham_so_ma_khach_hang INT,
  IN tham_so_so_ngay_toi INT
)
BEGIN
  DECLARE bien_so_ngay_toi INT DEFAULT 30;
  SET bien_so_ngay_toi = COALESCE(tham_so_so_ngay_toi, 30);

  SELECT *
  FROM `view_lo_hang_sap_het_han`
  WHERE `ma_khach_hang` = tham_so_ma_khach_hang
    AND `so_ngay_con_lai` BETWEEN 0 AND bien_so_ngay_toi
  ORDER BY `han_su_dung`, `ten_san_pham`, `so_lo`;
END$$

CREATE PROCEDURE `procedure_lay_san_pham_xuat_nhieu_nhat`(
  IN tham_so_ma_khach_hang INT,
  IN tham_so_nam INT,
  IN tham_so_thang INT,
  IN tham_so_gioi_han INT
)
BEGIN
  DECLARE bien_gioi_han INT DEFAULT 10;
  SET bien_gioi_han = COALESCE(NULLIF(tham_so_gioi_han, 0), 10);

  SELECT
    `ma_khach_hang`,
    `ten_khach_hang`,
    `ma_san_pham`,
    `ten_san_pham`,
    `nam_xuat`,
    `thang_xuat`,
    SUM(`tong_so_luong_xuat`) AS `tong_so_luong_xuat`,
    SUM(`tong_doanh_thu`) AS `tong_doanh_thu`
  FROM `view_xuat_hang_theo_thang`
  WHERE `ma_khach_hang` = tham_so_ma_khach_hang
    AND `nam_xuat` = tham_so_nam
    AND `thang_xuat` = tham_so_thang
  GROUP BY
    `ma_khach_hang`,
    `ten_khach_hang`,
    `ma_san_pham`,
    `ten_san_pham`,
    `nam_xuat`,
    `thang_xuat`
  ORDER BY `tong_so_luong_xuat` DESC, `tong_doanh_thu` DESC
  LIMIT bien_gioi_han;
END$$

CREATE PROCEDURE `procedure_hoan_tat_phieu_nhap`(IN tham_so_ma_phieu_nhap INT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM `phieu_nhap` WHERE `ma_phieu_nhap` = tham_so_ma_phieu_nhap
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Khong tim thay phieu nhap';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `phieu_nhap`
    WHERE `ma_phieu_nhap` = tham_so_ma_phieu_nhap
      AND `trang_thai` = 'Cancelled'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Khong the hoan tat phieu nhap da huy';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM `chi_tiet_phieu_nhap` WHERE `ma_phieu_nhap` = tham_so_ma_phieu_nhap
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phieu nhap chua co chi tiet';
  END IF;

  UPDATE `phieu_nhap`
  SET `trang_thai` = 'Completed'
  WHERE `ma_phieu_nhap` = tham_so_ma_phieu_nhap
    AND `trang_thai` <> 'Completed';

  SELECT *
  FROM `phieu_nhap`
  WHERE `ma_phieu_nhap` = tham_so_ma_phieu_nhap;
END$$

CREATE PROCEDURE `procedure_hoan_tat_phieu_xuat`(IN tham_so_ma_phieu_xuat INT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM `phieu_xuat` WHERE `ma_phieu_xuat` = tham_so_ma_phieu_xuat
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Khong tim thay phieu xuat';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `phieu_xuat`
    WHERE `ma_phieu_xuat` = tham_so_ma_phieu_xuat
      AND `trang_thai` = 'Cancelled'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Khong the hoan tat phieu xuat da huy';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM `chi_tiet_phieu_xuat` WHERE `ma_phieu_xuat` = tham_so_ma_phieu_xuat
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phieu xuat chua co chi tiet';
  END IF;

  UPDATE `phieu_xuat`
  SET `trang_thai` = 'Completed'
  WHERE `ma_phieu_xuat` = tham_so_ma_phieu_xuat
    AND `trang_thai` <> 'Completed';

  SELECT *
  FROM `phieu_xuat`
  WHERE `ma_phieu_xuat` = tham_so_ma_phieu_xuat;
END$$

CREATE TRIGGER `trigger_kiem_tra_kho_truoc_khi_them`
BEFORE INSERT ON `kho`
FOR EACH ROW
BEGIN
  SET NEW.`ten_kho` = TRIM(NEW.`ten_kho`);

  IF NEW.`ten_kho` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ten kho khong duoc de trong';
  END IF;

  IF NEW.`dien_tich` IS NOT NULL AND NEW.`dien_tich` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Dien tich kho phai lon hon 0';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_kho_truoc_khi_cap_nhat`
BEFORE UPDATE ON `kho`
FOR EACH ROW
BEGIN
  SET NEW.`ten_kho` = TRIM(NEW.`ten_kho`);

  IF NEW.`ten_kho` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ten kho khong duoc de trong';
  END IF;

  IF NEW.`dien_tich` IS NOT NULL AND NEW.`dien_tich` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Dien tich kho phai lon hon 0';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_hop_dong_thue_truoc_khi_them`
BEFORE INSERT ON `hop_dong_thue`
FOR EACH ROW
BEGIN
  IF NEW.`ngay_ket_thuc` < NEW.`ngay_bat_dau` THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ngay ket thuc hop dong phai lon hon hoac bang ngay bat dau';
  END IF;

  IF NEW.`trang_thai` IN ('Pending', 'Active') AND NEW.`ngay_ket_thuc` < CURDATE() THEN
    SET NEW.`trang_thai` = 'Expired';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_hop_dong_thue_truoc_khi_cap_nhat`
BEFORE UPDATE ON `hop_dong_thue`
FOR EACH ROW
BEGIN
  IF NEW.`ngay_ket_thuc` < NEW.`ngay_bat_dau` THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ngay ket thuc hop dong phai lon hon hoac bang ngay bat dau';
  END IF;

  IF NEW.`trang_thai` IN ('Pending', 'Active') AND NEW.`ngay_ket_thuc` < CURDATE() THEN
    SET NEW.`trang_thai` = 'Expired';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_san_pham_truoc_khi_them`
BEFORE INSERT ON `san_pham`
FOR EACH ROW
BEGIN
  SET NEW.`ten_san_pham` = TRIM(NEW.`ten_san_pham`);
  SET NEW.`don_vi_tinh` = TRIM(NEW.`don_vi_tinh`);

  IF NEW.`ten_san_pham` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ten san pham khong duoc de trong';
  END IF;

  IF NEW.`don_vi_tinh` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Don vi tinh khong duoc de trong';
  END IF;

  IF NEW.`gia_hien_tai` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gia hien tai khong duoc am';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_san_pham_truoc_khi_cap_nhat`
BEFORE UPDATE ON `san_pham`
FOR EACH ROW
BEGIN
  SET NEW.`ten_san_pham` = TRIM(NEW.`ten_san_pham`);
  SET NEW.`don_vi_tinh` = TRIM(NEW.`don_vi_tinh`);

  IF NEW.`ten_san_pham` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ten san pham khong duoc de trong';
  END IF;

  IF NEW.`don_vi_tinh` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Don vi tinh khong duoc de trong';
  END IF;

  IF NEW.`gia_hien_tai` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gia hien tai khong duoc am';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_ct_phieu_nhap_truoc_khi_them`
BEFORE INSERT ON `chi_tiet_phieu_nhap`
FOR EACH ROW
BEGIN
  SET NEW.`so_lo` = TRIM(NEW.`so_lo`);

  IF NEW.`so_lo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'So lo phieu nhap khong duoc de trong';
  END IF;

  IF NEW.`so_luong` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'So luong phieu nhap phai lon hon 0';
  END IF;

  IF NEW.`gia_nhap` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gia nhap khong duoc am';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_ct_phieu_nhap_truoc_khi_cap_nhat`
BEFORE UPDATE ON `chi_tiet_phieu_nhap`
FOR EACH ROW
BEGIN
  SET NEW.`so_lo` = TRIM(NEW.`so_lo`);

  IF NEW.`so_lo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'So lo phieu nhap khong duoc de trong';
  END IF;

  IF NEW.`so_luong` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'So luong phieu nhap phai lon hon 0';
  END IF;

  IF NEW.`gia_nhap` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gia nhap khong duoc am';
  END IF;
END$$

CREATE TRIGGER `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_nhap`
AFTER UPDATE ON `phieu_nhap`
FOR EACH ROW
BEGIN
  IF OLD.`trang_thai` <> 'Completed'
     AND NEW.`trang_thai` = 'Completed' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM `chi_tiet_phieu_nhap`
      WHERE `ma_phieu_nhap` = NEW.`ma_phieu_nhap`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phieu nhap chua co chi tiet';
    END IF;

    INSERT INTO `ton_kho` (`ma_kho`, `ma_san_pham`, `so_lo`, `so_luong`, `cap_nhat_luc`)
    SELECT NEW.`ma_kho`, chi_tiet_nhap.`ma_san_pham`, chi_tiet_nhap.`so_lo`, chi_tiet_nhap.`so_luong`, NOW()
    FROM `chi_tiet_phieu_nhap` chi_tiet_nhap
    WHERE chi_tiet_nhap.`ma_phieu_nhap` = NEW.`ma_phieu_nhap`
    ON DUPLICATE KEY UPDATE
      `so_luong` = `ton_kho`.`so_luong` + VALUES(`so_luong`),
      `cap_nhat_luc` = NOW();
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_ct_phieu_xuat_truoc_khi_them`
BEFORE INSERT ON `chi_tiet_phieu_xuat`
FOR EACH ROW
BEGIN
  SET NEW.`so_lo` = TRIM(NEW.`so_lo`);

  IF NEW.`so_lo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'So lo phieu xuat khong duoc de trong';
  END IF;

  IF NEW.`so_luong` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'So luong phieu xuat phai lon hon 0';
  END IF;

  IF NEW.`gia_ban` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gia ban khong duoc am';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_ct_phieu_xuat_truoc_khi_cap_nhat`
BEFORE UPDATE ON `chi_tiet_phieu_xuat`
FOR EACH ROW
BEGIN
  SET NEW.`so_lo` = TRIM(NEW.`so_lo`);

  IF NEW.`so_lo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'So lo phieu xuat khong duoc de trong';
  END IF;

  IF NEW.`so_luong` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'So luong phieu xuat phai lon hon 0';
  END IF;

  IF NEW.`gia_ban` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gia ban khong duoc am';
  END IF;
END$$

CREATE TRIGGER `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_phieu_xuat`
BEFORE UPDATE ON `phieu_xuat`
FOR EACH ROW
BEGIN
  IF NEW.`trang_thai` = 'Completed'
     AND (OLD.`trang_thai` <> 'Completed' OR OLD.`ma_kho` <> NEW.`ma_kho`) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM `chi_tiet_phieu_xuat`
      WHERE `ma_phieu_xuat` = NEW.`ma_phieu_xuat`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phieu xuat chua co chi tiet';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM (
        SELECT
          chi_tiet_xuat.`ma_san_pham`,
          chi_tiet_xuat.`so_lo`,
          SUM(chi_tiet_xuat.`so_luong`) AS `so_luong_yeu_cau`
        FROM `chi_tiet_phieu_xuat` chi_tiet_xuat
        WHERE chi_tiet_xuat.`ma_phieu_xuat` = NEW.`ma_phieu_xuat`
        GROUP BY chi_tiet_xuat.`ma_san_pham`, chi_tiet_xuat.`so_lo`
      ) tong_hop_xuat
      LEFT JOIN `ton_kho` ton_kho_hien_co
        ON ton_kho_hien_co.`ma_kho` = NEW.`ma_kho`
       AND ton_kho_hien_co.`ma_san_pham` = tong_hop_xuat.`ma_san_pham`
       AND ton_kho_hien_co.`so_lo` = tong_hop_xuat.`so_lo`
      WHERE COALESCE(ton_kho_hien_co.`so_luong`, 0) < tong_hop_xuat.`so_luong_yeu_cau`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ton kho khong du de hoan tat phieu xuat';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_xuat`
AFTER UPDATE ON `phieu_xuat`
FOR EACH ROW
BEGIN
  IF OLD.`trang_thai` <> 'Completed'
     AND NEW.`trang_thai` = 'Completed' THEN
    UPDATE `ton_kho` ton_kho
    JOIN (
      SELECT
        chi_tiet_xuat.`ma_san_pham`,
        chi_tiet_xuat.`so_lo`,
        SUM(chi_tiet_xuat.`so_luong`) AS `so_luong_yeu_cau`
      FROM `chi_tiet_phieu_xuat` chi_tiet_xuat
      WHERE chi_tiet_xuat.`ma_phieu_xuat` = NEW.`ma_phieu_xuat`
      GROUP BY chi_tiet_xuat.`ma_san_pham`, chi_tiet_xuat.`so_lo`
    ) tong_hop_xuat
      ON tong_hop_xuat.`ma_san_pham` = ton_kho.`ma_san_pham`
     AND tong_hop_xuat.`so_lo` = ton_kho.`so_lo`
    SET ton_kho.`so_luong` = ton_kho.`so_luong` - tong_hop_xuat.`so_luong_yeu_cau`,
        ton_kho.`cap_nhat_luc` = NOW()
    WHERE ton_kho.`ma_kho` = NEW.`ma_kho`;
  END IF;
END$$

DELIMITER ;
