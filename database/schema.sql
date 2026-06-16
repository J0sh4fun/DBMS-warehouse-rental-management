-- He thong quan ly cho thue kho va logistics
-- MySQL 8+ table schema generated from DBML with architectural constraints.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `chi_tiet_phieu_xuat`;
DROP TABLE IF EXISTS `phieu_xuat`;
DROP TABLE IF EXISTS `chi_tiet_phieu_nhap`;
DROP TABLE IF EXISTS `phieu_nhap`;
DROP TABLE IF EXISTS `ton_kho`;
DROP TABLE IF EXISTS `san_pham`;
DROP TABLE IF EXISTS `danh_muc`;
DROP TABLE IF EXISTS `nha_cung_cap`;
DROP TABLE IF EXISTS `nguoi_mua`;
DROP TABLE IF EXISTS `yeu_cau_thue_kho`;
DROP TABLE IF EXISTS `hop_dong_thue`;
DROP TABLE IF EXISTS `kho`;
DROP TABLE IF EXISTS `khach_hang`;
DROP TABLE IF EXISTS `quan_tri_vien`;

CREATE TABLE `quan_tri_vien` (
  `ma_quan_tri_vien` INT NOT NULL AUTO_INCREMENT,
  `ten_quan_tri_vien` VARCHAR(255) NOT NULL,
  `ten_dang_nhap` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `mat_khau` VARCHAR(255) NOT NULL,
  `tao_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_quan_tri_vien`),
  UNIQUE KEY `uk_admin_username` (`ten_dang_nhap`),
  UNIQUE KEY `uk_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `khach_hang` (
  `ma_khach_hang` INT NOT NULL AUTO_INCREMENT,
  `ten_khach_hang` VARCHAR(255) NOT NULL,
  `ten_dang_nhap` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `mat_khau` VARCHAR(255) NOT NULL,
  `so_dien_thoai` VARCHAR(30),
  `dia_chi` VARCHAR(255),
  `tao_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_khach_hang`),
  UNIQUE KEY `uk_customer_username` (`ten_dang_nhap`),
  UNIQUE KEY `uk_customer_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `kho` (
  `ma_kho` INT NOT NULL AUTO_INCREMENT,
  `ten_kho` VARCHAR(255) NOT NULL,
  `dia_chi` VARCHAR(255),
  `dien_tich` FLOAT,
  `gia_thue` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `trang_thai` ENUM('Active', 'Maintenance', 'Inactive') NOT NULL,
  `ma_quan_tri_vien` INT NOT NULL,
  PRIMARY KEY (`ma_kho`),
  KEY `idx_warehouse_admin_id` (`ma_quan_tri_vien`),
  CONSTRAINT `fk_warehouse_admin`
    FOREIGN KEY (`ma_quan_tri_vien`) REFERENCES `quan_tri_vien` (`ma_quan_tri_vien`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `hop_dong_thue` (
  `ma_hop_dong` INT NOT NULL AUTO_INCREMENT,
  `ma_khach_hang` INT NOT NULL,
  `ma_kho` INT NOT NULL,
  `ngay_bat_dau` DATE NOT NULL,
  `ngay_ket_thuc` DATE NOT NULL,
  `gia_thue` DECIMAL(18,2) NOT NULL,
  `trang_thai` ENUM('Pending', 'Active', 'Expired', 'Cancelled') NOT NULL,
  `muc_dich` VARCHAR(255),
  `tao_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_hop_dong`),
  KEY `idx_lease_customer_id` (`ma_khach_hang`),
  KEY `idx_lease_warehouse_id` (`ma_kho`),
  CONSTRAINT `fk_lease_customer`
    FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_khach_hang`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_lease_warehouse`
    FOREIGN KEY (`ma_kho`) REFERENCES `kho` (`ma_kho`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `yeu_cau_thue_kho` (
  `ma_yeu_cau` INT NOT NULL AUTO_INCREMENT,
  `ma_khach_hang` INT NOT NULL,
  `ma_kho` INT NOT NULL,
  `ngay_bat_dau` DATE NOT NULL,
  `ngay_ket_thuc` DATE NOT NULL,
  `gia_thue` DECIMAL(18,2) NOT NULL,
  `muc_dich` VARCHAR(255),
  `trang_thai` ENUM('Pending', 'Approved', 'Rejected') NOT NULL,
  `ghi_chu_duyet` VARCHAR(255),
  `ma_hop_dong` INT,
  `tao_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duyet_luc` DATETIME,
  PRIMARY KEY (`ma_yeu_cau`),
  KEY `idx_rental_request_customer_id` (`ma_khach_hang`),
  KEY `idx_rental_request_warehouse_id` (`ma_kho`),
  UNIQUE KEY `uk_rental_request_contract_id` (`ma_hop_dong`),
  CONSTRAINT `fk_rental_request_customer`
    FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_khach_hang`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_request_warehouse`
    FOREIGN KEY (`ma_kho`) REFERENCES `kho` (`ma_kho`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_request_contract`
    FOREIGN KEY (`ma_hop_dong`) REFERENCES `hop_dong_thue` (`ma_hop_dong`)
    ON UPDATE RESTRICT ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nguoi_mua` (
  `ma_nguoi_mua` INT NOT NULL AUTO_INCREMENT,
  `ten_nguoi_mua` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `so_dien_thoai` VARCHAR(30),
  `dia_chi` VARCHAR(255),
  `ma_khach_hang` INT NOT NULL,
  `da_xoa` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`ma_nguoi_mua`),
  KEY `idx_buyer_customer_id` (`ma_khach_hang`),
  CONSTRAINT `fk_buyer_customer`
    FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_khach_hang`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `danh_muc` (
  `ma_danh_muc` INT NOT NULL AUTO_INCREMENT,
  `ten_danh_muc` VARCHAR(255) NOT NULL,
  `ma_khach_hang` INT NOT NULL,
  `da_xoa` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`ma_danh_muc`),
  KEY `idx_category_customer_id` (`ma_khach_hang`),
  CONSTRAINT `fk_category_customer`
    FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_khach_hang`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nha_cung_cap` (
  `ma_nha_cung_cap` INT NOT NULL AUTO_INCREMENT,
  `ten_nha_cung_cap` VARCHAR(255) NOT NULL,
  `so_dien_thoai` VARCHAR(30),
  `dia_chi` VARCHAR(255),
  `ma_khach_hang` INT NOT NULL,
  `da_xoa` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`ma_nha_cung_cap`),
  KEY `idx_supplier_customer_id` (`ma_khach_hang`),
  CONSTRAINT `fk_supplier_customer`
    FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_khach_hang`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `san_pham` (
  `ma_san_pham` INT NOT NULL AUTO_INCREMENT,
  `ten_san_pham` VARCHAR(255) NOT NULL,
  `gia_hien_tai` DECIMAL(18,2) NOT NULL,
  `don_vi_tinh` VARCHAR(100) NOT NULL,
  `ma_khach_hang` INT NOT NULL,
  `ma_danh_muc` INT NOT NULL,
  `da_xoa` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`ma_san_pham`),
  KEY `idx_product_customer_id` (`ma_khach_hang`),
  KEY `idx_product_category_id` (`ma_danh_muc`),
  CONSTRAINT `fk_product_customer`
    FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_khach_hang`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_product_category`
    FOREIGN KEY (`ma_danh_muc`) REFERENCES `danh_muc` (`ma_danh_muc`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ton_kho` (
  `ma_kho` INT NOT NULL,
  `ma_san_pham` INT NOT NULL,
  `so_lo` VARCHAR(100) NOT NULL,
  `so_luong` INT NOT NULL,
  `cap_nhat_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_kho`, `ma_san_pham`, `so_lo`),
  KEY `idx_inventory_product_id` (`ma_san_pham`),
  CONSTRAINT `fk_inventory_warehouse`
    FOREIGN KEY (`ma_kho`) REFERENCES `kho` (`ma_kho`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_inventory_product`
    FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `phieu_nhap` (
  `ma_phieu_nhap` INT NOT NULL AUTO_INCREMENT,
  `ma_kho` INT NOT NULL,
  `ma_nha_cung_cap` INT NOT NULL,
  `ngay_nhap` DATETIME NOT NULL,
  `trang_thai` ENUM('Draft', 'Completed', 'Cancelled') NOT NULL,
  `tao_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_phieu_nhap`),
  KEY `idx_inbound_warehouse_id` (`ma_kho`),
  KEY `idx_inbound_supplier_id` (`ma_nha_cung_cap`),
  CONSTRAINT `fk_inbound_warehouse`
    FOREIGN KEY (`ma_kho`) REFERENCES `kho` (`ma_kho`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_inbound_supplier`
    FOREIGN KEY (`ma_nha_cung_cap`) REFERENCES `nha_cung_cap` (`ma_nha_cung_cap`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chi_tiet_phieu_nhap` (
  `ma_phieu_nhap` INT NOT NULL,
  `ma_san_pham` INT NOT NULL,
  `so_lo` VARCHAR(100) NOT NULL,
  `so_luong` INT NOT NULL,
  `gia_nhap` DECIMAL(18,2) NOT NULL,
  `han_su_dung` DATE,
  PRIMARY KEY (`ma_phieu_nhap`, `ma_san_pham`, `so_lo`),
  KEY `idx_inbound_detail_product_id` (`ma_san_pham`),
  CONSTRAINT `fk_inbound_detail_receipt`
    FOREIGN KEY (`ma_phieu_nhap`) REFERENCES `phieu_nhap` (`ma_phieu_nhap`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_inbound_detail_product`
    FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `phieu_xuat` (
  `ma_phieu_xuat` INT NOT NULL AUTO_INCREMENT,
  `ma_kho` INT NOT NULL,
  `ma_nguoi_mua` INT NOT NULL,
  `ngay_xuat` DATETIME NOT NULL,
  `trang_thai` ENUM('Draft', 'Completed', 'Cancelled') NOT NULL,
  `tao_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_phieu_xuat`),
  KEY `idx_outbound_warehouse_id` (`ma_kho`),
  KEY `idx_outbound_buyer_id` (`ma_nguoi_mua`),
  CONSTRAINT `fk_outbound_warehouse`
    FOREIGN KEY (`ma_kho`) REFERENCES `kho` (`ma_kho`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_outbound_buyer`
    FOREIGN KEY (`ma_nguoi_mua`) REFERENCES `nguoi_mua` (`ma_nguoi_mua`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chi_tiet_phieu_xuat` (
  `ma_phieu_xuat` INT NOT NULL,
  `ma_san_pham` INT NOT NULL,
  `so_lo` VARCHAR(100) NOT NULL,
  `so_luong` INT NOT NULL,
  `gia_ban` DECIMAL(18,2) NOT NULL,
  PRIMARY KEY (`ma_phieu_xuat`, `ma_san_pham`, `so_lo`),
  KEY `idx_outbound_detail_product_id` (`ma_san_pham`),
  CONSTRAINT `fk_outbound_detail_issue`
    FOREIGN KEY (`ma_phieu_xuat`) REFERENCES `phieu_xuat` (`ma_phieu_xuat`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_outbound_detail_product`
    FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;



