# Tóm tắt CSDL để thuyết trình DBMS
**Đề tài:** Hệ thống quản lý cho thuê kho và logistics

## 1) Giới thiệu bài toán và mục tiêu hệ thống
Hệ thống giải quyết bài toán quản lý **cho thuê kho + vận hành logistics** trên cùng một nền tảng dữ liệu: quản lý kho, hợp đồng thuê, yêu cầu thuê, nhập kho, xuất kho, tồn kho theo lô, nhà cung cấp, người mua và báo cáo.

- **Đối tượng sử dụng chính:** `quan_tri_vien` và `khach_hang` (theo thiết kế tài khoản hiện tại).
- **Vấn đề thực tế:** dữ liệu kho và dữ liệu cho thuê thường rời rạc, dễ trùng lặp, khó truy vết theo lô hàng và hợp đồng.
- **Mục tiêu database:** lưu trữ tập trung, giảm dư thừa dữ liệu, đảm bảo toàn vẹn bằng khóa/ràng buộc/trigger, hỗ trợ truy vấn báo cáo nhanh.

## 2) Phạm vi chức năng của hệ thống
Các module được thiết kế bám theo nghiệp vụ:
- Quản lý tài khoản và xác thực (`quan_tri_vien`, `khach_hang`).
- Quản lý kho cho thuê (`kho`, `hop_dong_thue`, `yeu_cau_thue_kho`).
- Quản lý master data hàng hóa (`danh_muc`, `san_pham`, `nha_cung_cap`, `nguoi_mua`).
- Quản lý giao dịch kho (`phieu_nhap`, `phieu_xuat`, `ton_kho` theo batch).
- Báo cáo và thống kê tồn kho/xuất hàng/hạn dùng.

**Luồng nghiệp vụ ngắn gọn:**  
Khách hàng gửi yêu cầu thuê kho -> quan_tri_vien duyệt/từ chối -> tạo hợp đồng -> khách hàng nhập kho/xuất kho -> hệ thống cập nhật tồn kho -> sinh báo cáo.

## 3) Phân tích nghiệp vụ / Use Case
| Actor | Chức năng chính |
|---|---|
| khach_hang | Đăng ký/đăng nhập, gửi yêu cầu thuê kho, quản lý danh mục/sản phẩm/NCC/người mua, nhập kho/xuất kho, xem tồn kho và báo cáo |
| quan_tri_vien | Quản lý kho, duyệt yêu cầu thuê, quản lý hợp đồng, quản lý danh sách khách hàng |
| Hệ thống DBMS | Kiểm tra ràng buộc, tự động cập nhật tồn kho qua trigger, tính toán báo cáo qua view/function/procedure |

**Use case trọng tâm để trình bày (3-5 ý):**
1. Duyệt yêu cầu thuê kho và liên kết hợp đồng.
2. Hoàn tất phiếu nhập để tăng tồn kho theo batch.
3. Hoàn tất phiếu xuất để giảm tồn kho, chặn xuất vượt tồn.
4. Theo dõi lô hàng sắp hết hạn.
5. Thống kê top sản phẩm xuất theo tháng.

## 4) Thiết kế CSDL khái niệm (ERD)
**Entity chính (14 bảng):** `quan_tri_vien`, `khach_hang`, `kho`, `hop_dong_thue`, `yeu_cau_thue_kho`, `danh_muc`, `san_pham`, `nha_cung_cap`, `nguoi_mua`, `ton_kho`, `phieu_nhap`, `chi_tiet_phieu_nhap`, `phieu_xuat`, `chi_tiet_phieu_xuat`.

**Quan hệ chính:**
- `quan_tri_vien` 1-n `kho`.
- `khach_hang` 1-n `hop_dong_thue`, `yeu_cau_thue_kho`, `danh_muc`, `san_pham`, `nha_cung_cap`, `nguoi_mua`.
- `kho` 1-n `phieu_nhap`, `phieu_xuat`, `hop_dong_thue`.
- `phieu_nhap` 1-n `chi_tiet_phieu_nhap`.
- `phieu_xuat` 1-n `chi_tiet_phieu_xuat`.

**Quan hệ n-n đã tách bảng trung gian (dạng detail):**
- `phieu_nhap` n-n `san_pham` qua `chi_tiet_phieu_nhap`.
- `phieu_xuat` n-n `san_pham` qua `chi_tiet_phieu_xuat`.

## 5) Thiết kế logic: bảng, PK, FK
| Bảng | Vai trò | Khóa chính | Khóa ngoại quan trọng |
|---|---|---|---|
| `khach_hang` | Thông tin khách thuê | `ma_khach_hang` | - |
| `kho` | Kho cho thuê | `ma_kho` | `ma_quan_tri_vien -> quan_tri_vien` |
| `hop_dong_thue` | Hợp đồng thuê kho | `ma_hop_dong` | `ma_khach_hang -> khach_hang`, `ma_kho -> kho` |
| `yeu_cau_thue_kho` | Yêu cầu thuê kho | `ma_yeu_cau` | `ma_khach_hang -> khach_hang`, `ma_kho -> kho`, `ma_hop_dong -> hop_dong_thue` |
| `san_pham` | Hàng hóa | `ma_san_pham` | `ma_khach_hang -> khach_hang`, `ma_danh_muc -> danh_muc` |
| `ton_kho` | Tồn kho theo lô | (`ma_kho`,`ma_san_pham`,`so_lo`) | `ma_kho -> kho`, `ma_san_pham -> san_pham` |
| `chi_tiet_phieu_nhap` | Chi tiết nhập kho | (`ma_phieu_nhap`,`ma_san_pham`,`so_lo`) | `ma_phieu_nhap -> phieu_nhap`, `ma_san_pham -> san_pham` |
| `chi_tiet_phieu_xuat` | Chi tiết xuất kho | (`ma_phieu_xuat`,`ma_san_pham`,`so_lo`) | `ma_phieu_xuat -> phieu_xuat`, `ma_san_pham -> san_pham` |

## 6) Chuẩn hóa dữ liệu
Database được thiết kế đến **3NF**:
- **1NF:** mỗi cột là một giá trị đơn, không có cột danh sách.
- **2NF:** các bảng chi tiết dùng khóa ghép; thuộc tính phụ thuộc đầy đủ vào khóa chính.
- **3NF:** tách riêng thực thể độc lập (khách hàng, kho, sản phẩm, hợp đồng, giao dịch) để tránh phụ thuộc bắc cầu và giảm lặp dữ liệu.

## 7) Ràng buộc toàn vẹn dữ liệu
- **PRIMARY KEY:** tất cả bảng đều có PK, đặc biệt PK ghép ở `ton_kho`, `chi_tiet_phieu_nhap`, `chi_tiet_phieu_xuat`.
- **FOREIGN KEY:** liên kết chặt giữa bảng nghiệp vụ; ví dụ hợp đồng phải tham chiếu khách hàng và kho hợp lệ.
- **UNIQUE:** `quan_tri_vien.ten_dang_nhap`, `quan_tri_vien.email`, `khach_hang.ten_dang_nhap`, `khach_hang.email`; `yeu_cau_thue_kho.ma_hop_dong` là unique.
- **NOT NULL/DEFAULT/ENUM:** áp dụng cho nhiều cột nghiệp vụ (trang_thai, giá, thời gian tạo...).
- **ON DELETE / ON UPDATE:** phần lớn `RESTRICT`, riêng `yeu_cau_thue_kho.ma_hop_dong` dùng `ON DELETE SET NULL`.
- **Kiểm tra nâng cao bằng trigger:** chặn số lượng âm, giá âm, ngày không hợp lệ, chặn xuất vượt tồn.

## 8) Các truy vấn SQL quan trọng (gợi ý demo)
```sql
-- 1) JOIN: Danh sách yêu cầu thuê đang chờ duyệt
SELECT r.ma_yeu_cau, c.ten_khach_hang, w.ten_kho, r.ngay_bat_dau, r.ngay_ket_thuc, r.trang_thai
FROM yeu_cau_thue_kho r
JOIN khach_hang c ON c.ma_khach_hang = r.ma_khach_hang
JOIN kho w ON w.ma_kho = r.ma_kho
WHERE r.trang_thai = 'Pending'
ORDER BY r.tao_luc DESC;

-- 2) GROUP BY: Tổng giá trị tồn kho theo khách hàng
SELECT p.ma_khach_hang, SUM(i.so_luong * p.gia_hien_tai) AS TotalInventoryValue
FROM ton_kho i
JOIN san_pham p ON p.ma_san_pham = i.ma_san_pham
GROUP BY p.ma_khach_hang;

-- 3) Top 5 sản phẩm xuất nhiều nhất theo tháng
SELECT p.ma_san_pham, p.ten_san_pham, SUM(od.so_luong) AS TotalExportQty
FROM chi_tiet_phieu_xuat od
JOIN phieu_xuat o ON o.ma_phieu_xuat = od.ma_phieu_xuat
JOIN san_pham p ON p.ma_san_pham = od.ma_san_pham
WHERE o.trang_thai = 'Completed'
  AND YEAR(o.ngay_xuat) = 2026
  AND MONTH(o.ngay_xuat) = 4
GROUP BY p.ma_san_pham, p.ten_san_pham
ORDER BY TotalExportQty DESC
LIMIT 5;
```

## 9) View, Stored Procedure, Trigger
- **Views (4):** `view_khach_thue_hien_tai`, `view_tong_hop_ton_kho`, `view_lo_hang_sap_het_han`, `view_xuat_hang_theo_thang`.
- **Functions (3):** `function_gia_tri_ton_kho_theo_lo`, `function_gia_tri_ton_kho_cua_khach_hang`, `function_ton_kho_kha_dung`.
- **Stored Procedures (7):** ví dụ `procedure_cap_nhat_hop_dong_thue_het_han`, `procedure_hoan_tat_phieu_nhap`, `procedure_hoan_tat_phieu_xuat`, `procedure_lay_san_pham_xuat_nhieu_nhat`.
- **Triggers (13):**
  - Validate dữ liệu đầu vào trước insert/update.
  - Tự động cộng tồn khi phiếu nhập chuyển `Draft -> Completed` và trừ tồn khi phiếu xuất chuyển `Draft -> Completed`.
  - Chặn hoàn tất phiếu xuất khi tồn kho không đủ.

## 10) Transaction và xử lý lỗi
- Ở tầng ứng dụng (Spring), các nghiệp vụ chính dùng `@Transactional` để đảm bảo **atomicity** (thành công toàn bộ hoặc rollback toàn bộ).
- Có dùng `PESSIMISTIC_WRITE` khi thao tác tồn kho để giảm tranh chấp cập nhật đồng thời.
- Trong DB, stored procedure/trigger dùng `SIGNAL SQLSTATE '45000'` để trả lỗi nghiệp vụ rõ ràng (ví dụ: thiếu detail, xuất vượt tồn, phiếu đã hủy).
- Có thể trình bày theo ACID: cập nhật phiếu + tồn kho là một đơn vị nhất quán.

## 11) Bảo mật và phân quyền
- Hệ thống dùng JWT và phân quyền theo vai trò: `ROLE_ADMIN`, `ROLE_CUSTOMER`.
- API được chặn theo role bằng `@PreAuthorize`.
- Mật khẩu được hash bằng `BCrypt` trước khi lưu DB.
- Mỗi vai trò chỉ truy cập dữ liệu đúng phạm vi nghiệp vụ:
  - **quan_tri_vien:** quản lý kho, duyệt yêu cầu thuê, quản lý hợp đồng/khách hàng.
  - **khach_hang:** quản lý dữ liệu hàng hóa, nhập-xuất-tồn và xem báo cáo của mình.

---
## Phụ lục: nội dung thư mục `database`
| File | Vai trò |
|---|---|
| `schema.sql` | Script đầy đủ: tạo bảng + ràng buộc + view + function + procedure + trigger. |
| `dbms_objects.sql` | Script bổ sung DBMS object khi bảng đã có từ Hibernate. |
| `sample_data.sql` | Dữ liệu mẫu demo, idempotent với `ON DUPLICATE KEY UPDATE`. |




