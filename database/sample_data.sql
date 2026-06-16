-- Sample data for the Hibernate-created MySQL schema.
-- Login accounts created/updated by this script:
--   admins:   admin1@gmail.com / 12345678
--          
--   customers:
--             customer1@gmail.com / 12345678
--             customer2@gmail.com / 12345678
--             customer3@gmail.com / 12345678
--             customer4@gmail.com / 12345678
--             customer5@gmail.com / 12345678
--
-- The script is idempotent for the sample IDs below.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SET @mat_khau_mau = '$2a$10$lg7jM95UjJcON5ZzNfgmRuDB444DTSrXtfJ50J9iz7zRIchs2Ied2';

INSERT INTO `quan_tri_vien` (`ten_quan_tri_vien`, `ten_dang_nhap`, `email`, `mat_khau`, `tao_luc`)
VALUES
  ('quan_tri_vien 1', 'admin1@gmail.com', 'admin1@gmail.com', @mat_khau_mau, NOW())
ON DUPLICATE KEY UPDATE
  `ten_quan_tri_vien` = VALUES(`ten_quan_tri_vien`),
  `mat_khau` = VALUES(`mat_khau`);

INSERT INTO `khach_hang` (`ten_khach_hang`, `ten_dang_nhap`, `email`, `mat_khau`, `so_dien_thoai`, `dia_chi`, `tao_luc`)
VALUES
  ('khach_hang 1', 'customer1@gmail.com', 'customer1@gmail.com', @mat_khau_mau, '0900000001', 'Ho Chi Minh City', NOW()),
  ('khach_hang 2', 'customer2@gmail.com', 'customer2@gmail.com', @mat_khau_mau, '0900000002', 'Ha Noi', NOW()),
  ('khach_hang 3', 'customer3@gmail.com', 'customer3@gmail.com', @mat_khau_mau, '0900000003', 'Da Nang', NOW()),
  ('khach_hang 4', 'customer4@gmail.com', 'customer4@gmail.com', @mat_khau_mau, '0900000004', 'Can Tho', NOW()),
  ('khach_hang 5', 'customer5@gmail.com', 'customer5@gmail.com', @mat_khau_mau, '0900000005', 'Hai Phong', NOW())
ON DUPLICATE KEY UPDATE
  `ten_khach_hang` = VALUES(`ten_khach_hang`),
  `mat_khau` = VALUES(`mat_khau`),
  `so_dien_thoai` = VALUES(`so_dien_thoai`),
  `dia_chi` = VALUES(`dia_chi`);

SET @ma_quan_tri_vien_1 = (SELECT `ma_quan_tri_vien` FROM `quan_tri_vien` WHERE `ten_dang_nhap` = 'admin1@gmail.com' LIMIT 1);
SET @ma_khach_hang_1 = (SELECT `ma_khach_hang` FROM `khach_hang` WHERE `ten_dang_nhap` = 'customer1@gmail.com' LIMIT 1);

INSERT INTO `kho` (`ma_kho`, `ten_kho`, `dia_chi`, `dien_tich`, `gia_thue`, `trang_thai`, `ma_quan_tri_vien`) VALUES
  (9101, 'Sample Cold Storage A', 'District 7, Ho Chi Minh City', 1200, 12000000.00, 'Active', @ma_quan_tri_vien_1),
  (9102, 'Sample Dry kho B', 'Thu Duc, Ho Chi Minh City', 1800, 15000000.00, 'Active', @ma_quan_tri_vien_1),
  (9103, 'Sample Maintenance kho', 'Binh Thanh, Ho Chi Minh City', 900, 9000000.00, 'Maintenance', @ma_quan_tri_vien_1),
  (9104, 'Sample Inactive kho', 'Tan Binh, Ho Chi Minh City', 750, 7000000.00, 'Inactive', @ma_quan_tri_vien_1)
ON DUPLICATE KEY UPDATE
  `ten_kho` = VALUES(`ten_kho`),
  `dia_chi` = VALUES(`dia_chi`),
  `dien_tich` = VALUES(`dien_tich`),
  `gia_thue` = VALUES(`gia_thue`),
  `trang_thai` = VALUES(`trang_thai`),
  `ma_quan_tri_vien` = VALUES(`ma_quan_tri_vien`);

INSERT INTO `hop_dong_thue` (`ma_hop_dong`, `ma_khach_hang`, `ma_kho`, `ngay_bat_dau`, `ngay_ket_thuc`, `gia_thue`, `trang_thai`, `muc_dich`, `tao_luc`) VALUES
  (9201, @ma_khach_hang_1, 9101, '2026-04-01', '2026-12-31', 12000000.00, 'Active', 'Sample active rental contract', NOW()),
  (9202, @ma_khach_hang_1, 9103, '2026-01-01', '2026-03-31', 9000000.00, 'Expired', 'Expired sample contract', NOW())
ON DUPLICATE KEY UPDATE
  `ma_khach_hang` = VALUES(`ma_khach_hang`),
  `ma_kho` = VALUES(`ma_kho`),
  `ngay_bat_dau` = VALUES(`ngay_bat_dau`),
  `ngay_ket_thuc` = VALUES(`ngay_ket_thuc`),
  `gia_thue` = VALUES(`gia_thue`),
  `trang_thai` = VALUES(`trang_thai`),
  `muc_dich` = VALUES(`muc_dich`);

INSERT INTO `yeu_cau_thue_kho` (`ma_yeu_cau`, `ma_khach_hang`, `ma_kho`, `ngay_bat_dau`, `ngay_ket_thuc`, `gia_thue`, `muc_dich`, `trang_thai`, `ghi_chu_duyet`, `ma_hop_dong`, `tao_luc`, `duyet_luc`) VALUES
  (9301, @ma_khach_hang_1, 9101, '2026-04-01', '2026-12-31', 12000000.00, 'Sample approved request', 'Approved', 'Approved sample request', 9201, NOW(), NOW()),
  (9302, @ma_khach_hang_1, 9102, '2026-05-01', '2026-08-31', 15000000.00, 'Need extra dry storage', 'Pending', NULL, NULL, NOW(), NULL),
  (9303, @ma_khach_hang_1, 9102, '2026-09-01', '2026-10-31', 15000000.00, 'Short-term overflow storage', 'Rejected', 'kho reserved for internal maintenance window', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `ma_khach_hang` = VALUES(`ma_khach_hang`),
  `ma_kho` = VALUES(`ma_kho`),
  `ngay_bat_dau` = VALUES(`ngay_bat_dau`),
  `ngay_ket_thuc` = VALUES(`ngay_ket_thuc`),
  `gia_thue` = VALUES(`gia_thue`),
  `muc_dich` = VALUES(`muc_dich`),
  `trang_thai` = VALUES(`trang_thai`),
  `ghi_chu_duyet` = VALUES(`ghi_chu_duyet`),
  `ma_hop_dong` = VALUES(`ma_hop_dong`),
  `duyet_luc` = VALUES(`duyet_luc`);

INSERT INTO `danh_muc` (`ma_danh_muc`, `ten_danh_muc`, `ma_khach_hang`, `da_xoa`) VALUES
  (9401, 'Electronics', @ma_khach_hang_1, FALSE),
  (9402, 'Food Ingredients', @ma_khach_hang_1, FALSE)
ON DUPLICATE KEY UPDATE
  `ten_danh_muc` = VALUES(`ten_danh_muc`),
  `ma_khach_hang` = VALUES(`ma_khach_hang`),
  `da_xoa` = VALUES(`da_xoa`);

INSERT INTO `nha_cung_cap` (`ma_nha_cung_cap`, `ten_nha_cung_cap`, `so_dien_thoai`, `dia_chi`, `ma_khach_hang`, `da_xoa`) VALUES
  (9501, 'Saigon Supply Co.', '0901000001', 'District 1, Ho Chi Minh City', @ma_khach_hang_1, FALSE),
  (9502, 'Mekong Fresh Logistics', '0901000002', 'Can Tho', @ma_khach_hang_1, FALSE)
ON DUPLICATE KEY UPDATE
  `ten_nha_cung_cap` = VALUES(`ten_nha_cung_cap`),
  `so_dien_thoai` = VALUES(`so_dien_thoai`),
  `dia_chi` = VALUES(`dia_chi`),
  `ma_khach_hang` = VALUES(`ma_khach_hang`),
  `da_xoa` = VALUES(`da_xoa`);

INSERT INTO `nguoi_mua` (`ma_nguoi_mua`, `ten_nguoi_mua`, `email`, `so_dien_thoai`, `dia_chi`, `ma_khach_hang`, `da_xoa`) VALUES
  (9601, 'Sample Retail nguoi_mua', 'nguoi_mua@example.com', '0902000001', 'District 3, Ho Chi Minh City', @ma_khach_hang_1, FALSE),
  (9602, 'Sample Wholesale nguoi_mua', 'wholesale@example.com', '0902000002', 'Da Nang', @ma_khach_hang_1, FALSE)
ON DUPLICATE KEY UPDATE
  `ten_nguoi_mua` = VALUES(`ten_nguoi_mua`),
  `email` = VALUES(`email`),
  `so_dien_thoai` = VALUES(`so_dien_thoai`),
  `dia_chi` = VALUES(`dia_chi`),
  `ma_khach_hang` = VALUES(`ma_khach_hang`),
  `da_xoa` = VALUES(`da_xoa`);

INSERT INTO `san_pham` (`ma_san_pham`, `ten_san_pham`, `gia_hien_tai`, `don_vi_tinh`, `ma_khach_hang`, `ma_danh_muc`, `da_xoa`) VALUES
  (9701, 'Bluetooth Speaker', 450000.00, 'pcs', @ma_khach_hang_1, 9401, FALSE),
  (9702, 'Imported Butter', 120000.00, 'box', @ma_khach_hang_1, 9402, FALSE)
ON DUPLICATE KEY UPDATE
  `ten_san_pham` = VALUES(`ten_san_pham`),
  `gia_hien_tai` = VALUES(`gia_hien_tai`),
  `don_vi_tinh` = VALUES(`don_vi_tinh`),
  `ma_khach_hang` = VALUES(`ma_khach_hang`),
  `ma_danh_muc` = VALUES(`ma_danh_muc`),
  `da_xoa` = VALUES(`da_xoa`);

INSERT INTO `phieu_nhap` (`ma_phieu_nhap`, `ma_kho`, `ma_nha_cung_cap`, `ngay_nhap`, `trang_thai`, `tao_luc`) VALUES
  (9801, 9101, 9501, '2026-04-05 09:00:00', 'Completed', NOW()),
  (9802, 9101, 9502, '2026-04-20 10:30:00', 'Draft', NOW())
ON DUPLICATE KEY UPDATE
  `ma_kho` = VALUES(`ma_kho`),
  `ma_nha_cung_cap` = VALUES(`ma_nha_cung_cap`),
  `ngay_nhap` = VALUES(`ngay_nhap`),
  `trang_thai` = VALUES(`trang_thai`);

INSERT INTO `chi_tiet_phieu_nhap` (`ma_phieu_nhap`, `ma_san_pham`, `so_lo`, `so_luong`, `gia_nhap`, `han_su_dung`) VALUES
  (9801, 9701, 'SPK-A-2026', 150, 320000.00, NULL),
  (9801, 9702, 'BUTTER-APR26', 75, 85000.00, '2026-09-30'),
  (9802, 9701, 'SPK-DRAFT-2026', 20, 315000.00, NULL)
ON DUPLICATE KEY UPDATE
  `so_luong` = VALUES(`so_luong`),
  `gia_nhap` = VALUES(`gia_nhap`),
  `han_su_dung` = VALUES(`han_su_dung`);

INSERT INTO `phieu_xuat` (`ma_phieu_xuat`, `ma_kho`, `ma_nguoi_mua`, `ngay_xuat`, `trang_thai`, `tao_luc`) VALUES
  (9901, 9101, 9601, '2026-04-12 14:00:00', 'Completed', NOW()),
  (9902, 9101, 9602, '2026-04-25 15:00:00', 'Draft', NOW())
ON DUPLICATE KEY UPDATE
  `ma_kho` = VALUES(`ma_kho`),
  `ma_nguoi_mua` = VALUES(`ma_nguoi_mua`),
  `ngay_xuat` = VALUES(`ngay_xuat`),
  `trang_thai` = VALUES(`trang_thai`);

INSERT INTO `chi_tiet_phieu_xuat` (`ma_phieu_xuat`, `ma_san_pham`, `so_lo`, `so_luong`, `gia_ban`) VALUES
  (9901, 9701, 'SPK-A-2026', 30, 520000.00),
  (9902, 9702, 'BUTTER-APR26', 10, 150000.00)
ON DUPLICATE KEY UPDATE
  `so_luong` = VALUES(`so_luong`),
  `gia_ban` = VALUES(`gia_ban`);

INSERT INTO `ton_kho` (`ma_kho`, `ma_san_pham`, `so_lo`, `so_luong`, `cap_nhat_luc`) VALUES
  (9101, 9701, 'SPK-A-2026', 120, NOW()),
  (9101, 9702, 'BUTTER-APR26', 75, NOW())
ON DUPLICATE KEY UPDATE
  `so_luong` = VALUES(`so_luong`),
  `cap_nhat_luc` = VALUES(`cap_nhat_luc`);

SET FOREIGN_KEY_CHECKS = 1;


