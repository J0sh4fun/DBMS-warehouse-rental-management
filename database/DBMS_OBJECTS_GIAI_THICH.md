# Giải thích View, Function, Procedure, Trigger

Tài liệu này giải thích các DBMS object trong [dbms_objects.sql](/d:/Working/IdeaProjects/DBMS-kho-rental-management-merge-check/database/dbms_objects.sql:1): chúng làm gì, có tác dụng gì, và được tạo ra để phục vụ mục đích nghiệp vụ nào.

Phạm vi:
- `4` view
- `3` function
- `7` stored procedure
- `13` trigger

Quy ước ghi tên object trong tài liệu này:
- `[VIEW]` là view
- `[FUNCTION]` là function
- `[PROCEDURE]` là stored procedure
- `[TRIGGER]` là trigger

Lưu ý khi demo:
- Database runtime của project là `warehouse_db`.
- Tài khoản mẫu hiện dễ dùng nhất để demo là:
  - `admin1@gmail.com / 12345678`
  - `customer1@gmail.com / 12345678`
- Nếu đã import [sample_data.sql](/d:/Working/IdeaProjects/DBMS-kho-rental-management-merge-check/database/sample_data.sql:1), có thể dùng trực tiếp các ID mẫu như `9101`, `9701`, `9702`, `9802`, `9902`.
- Với các procedure hoàn tất phiếu nhập/xuất, demo sẽ làm thay đổi dữ liệu thật trong DB demo.
- Với `procedure_cap_nhat_hop_dong_thue_het_han()`, bộ sample hiện tại thường trả `0` vì dữ liệu quá hạn đã được đồng bộ sang `Expired` sẵn.

## 1. Tổng quan vai trò của DBMS object

Kiến trúc của project này đẩy một phần logic nghiệp vụ xuống MySQL thay vì giữ hết ở Java:

- `View` dùng để gom dữ liệu nhiều bảng thành các "bảng báo cáo" sẵn sàng cho truy vấn.
- `Function` dùng để tính nhanh các giá trị nghiệp vụ như tồn kho hiện có hay giá trị tồn kho.
- `Stored procedure` dùng để đóng gói thao tác nghiệp vụ nhiều bước thành một lệnh `CALL`.
- `Trigger` dùng để bảo vệ toàn vẹn dữ liệu và tự động đồng bộ tồn kho khi chứng từ thay đổi.

Ý nghĩa quan trọng nhất để trình bày với giảng viên:
- DB không chỉ lưu dữ liệu.
- DB còn chủ động kiểm tra ràng buộc nghiệp vụ.
- DB còn tự cập nhật tồn kho khi phiếu nhập/xuất chuyển trạng thái.

## 2. Views

| View | Nó làm gì | Tác dụng | Mục đích nghiệp vụ |
|---|---|---|---|
| [VIEW] `view_khach_thue_hien_tai` | Join `hop_dong_thue`, `khach_hang`, `kho`, `quan_tri_vien`; chỉ lấy hợp đồng `Active` và còn hiệu lực theo ngày hiện tại | Cho ra danh sách khách thuê đang sử dụng kho | Hỗ trợ quan_tri_vien xem khách thuê hiện tại theo kho mình quản lý |
| [VIEW] `view_tong_hop_ton_kho` | Tổng hợp tồn kho theo khách hàng, kho, sản phẩm, danh_muc; tính `tong_so_luong`, `tong_gia_tri_ton_kho`, `so_lo_hang` | Biến dữ liệu tồn kho chi tiết theo batch thành báo cáo tổng hợp dễ đọc | Hỗ trợ dashboard tồn kho và báo cáo giá trị hàng hóa |
| [VIEW] `view_lo_hang_sap_het_han` | Lấy các lô nhập đã hoàn tất, nối với `ton_kho` để biết số lượng hiện còn, hạn dùng và số ngày còn lại | Theo dõi lô sắp hết hạn nhưng chỉ tính phần còn tồn thật | Hỗ trợ cảnh báo hàng sắp hết hạn và xử lý hàng tồn |
| [VIEW] `view_xuat_hang_theo_thang` | Tổng hợp lượng xuất và doanh thu theo tháng từ `phieu_xuat` và `chi_tiet_phieu_xuat` | Cho ra dữ liệu nền để lọc top sản phẩm xuất nhiều | Hỗ trợ báo cáo bán hàng/xuất kho theo tháng |

### Query nhanh để demo view

```sql
USE warehouse_db;

SELECT * FROM view_khach_thue_hien_tai;

SELECT * 
FROM view_tong_hop_ton_kho
ORDER BY tong_gia_tri_ton_kho DESC;

SELECT *
FROM view_lo_hang_sap_het_han
ORDER BY han_su_dung, ten_san_pham;

SELECT *
FROM view_xuat_hang_theo_thang
WHERE nam_xuat = 2026
  AND thang_xuat = 4
ORDER BY tong_so_luong_xuat DESC;
```

## 3. Functions

| Function | Input | Output | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [FUNCTION] `function_gia_tri_ton_kho_theo_lo` | `ma_kho`, `ma_san_pham`, `so_lo` | `DECIMAL(18,2)` | Tính giá trị tồn kho của đúng một lô hàng trong một kho | Dùng khi cần biết giá trị tiền của từng batch |
| [FUNCTION] `function_gia_tri_ton_kho_cua_khach_hang` | `ma_khach_hang` | `DECIMAL(18,2)` | Tính tổng giá trị tồn kho của toàn bộ sản phẩm thuộc một khách hàng | Dùng cho báo cáo tổng tài sản lưu kho của khách |
| [FUNCTION] `function_ton_kho_kha_dung` | `ma_kho`, `ma_san_pham`, `so_lo` | `INT` | Trả về số lượng tồn khả dụng hiện tại của một batch | Dùng trong trigger/procedure để kiểm tra tồn kho trước khi hoàn tất phiếu xuất |

### Query nhanh để demo function

```sql
USE warehouse_db;

SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

SELECT function_gia_tri_ton_kho_theo_lo(9101, 9701, 'SPK-A-2026') AS gia_tri_lo;

SELECT function_gia_tri_ton_kho_cua_khach_hang(@ma_khach_hang) AS gia_tri_ton_kho_khach_hang;

SELECT function_ton_kho_kha_dung(9101, 9702, 'BUTTER-APR26') AS so_luong_kha_dung;
```

## 4. Stored Procedures

Phần này là quan trọng nhất khi demo vì giảng viên sẽ nhìn thấy rõ DB xử lý nghiệp vụ bằng `CALL`.

Gợi ý demo procedure theo thứ tự an toàn:
- Muốn ra dữ liệu ngay, ít rủi ro: `procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien`, `procedure_lay_gia_tri_ton_kho_khach_hang`, `procedure_lay_lo_hang_sap_het_han`, `procedure_lay_san_pham_xuat_nhieu_nhat`
- Muốn thấy dữ liệu thay đổi rõ ràng trước/sau: `procedure_hoan_tat_phieu_nhap`, `procedure_hoan_tat_phieu_xuat`
- `procedure_cap_nhat_hop_dong_thue_het_han()` nên demo theo hướng giải thích kiến trúc, vì trên bộ sample hiện tại nó thường trả `0` và đó là kết quả đúng

Quan hệ quan trọng giữa procedure và trigger trong luồng nhập/xuất:
- `procedure_hoan_tat_phieu_nhap()` chỉ đổi trạng thái phiếu nhập sang `Completed`; trigger `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_nhap` mới là phần tự cộng tồn kho.
- `procedure_hoan_tat_phieu_xuat()` chỉ đổi trạng thái phiếu xuất sang `Completed`; trigger `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_phieu_xuat` chặn xuất vượt tồn trước khi update, còn trigger `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_xuat` mới là phần tự trừ tồn kho.
- Vì vậy procedure là "lệnh nghiệp vụ", còn trigger là "phản ứng tự động của database" sau khi trạng thái đổi.

### Query hỗ trợ tìm ID demo

Nếu dữ liệu mẫu của bạn không còn đúng trạng thái ban đầu, có thể dùng các query này để tìm record phù hợp:

```sql
USE warehouse_db;

SELECT ma_quan_tri_vien, ten_quan_tri_vien, ten_dang_nhap
FROM quan_tri_vien
ORDER BY ma_quan_tri_vien;

SELECT ma_khach_hang, ten_khach_hang, ten_dang_nhap
FROM khach_hang
ORDER BY ma_khach_hang;

SELECT ma_phieu_nhap, ma_kho, trang_thai
FROM phieu_nhap
ORDER BY ma_phieu_nhap;

SELECT ma_phieu_xuat, ma_kho, trang_thai
FROM phieu_xuat
ORDER BY ma_phieu_xuat;

SELECT ma_hop_dong, ma_khach_hang, ma_kho, trang_thai, ngay_ket_thuc
FROM hop_dong_thue
ORDER BY ma_hop_dong;
```

### 4.1. [PROCEDURE] `procedure_cap_nhat_hop_dong_thue_het_han()`

Nó làm gì:
- Tìm các hợp đồng có `ngay_ket_thuc < CURDATE()`
- Nếu trang_thai đang là `Pending` hoặc `Active` thì đổi sang `Expired`
- Trả về số dòng vừa được cập nhật qua cột `so_hop_dong_het_han`

Tác dụng:
- Đảm bảo hợp đồng quá hạn không tiếp tục bị xem là còn hiệu lực
- Là một thủ tục bảo trì dữ liệu hàng loạt

Mục đích nghiệp vụ:
- Tự động chuẩn hóa trạng thái hợp đồng theo thời gian

Lưu ý:
- Trong project này, trigger ở `hop_dong_thue` cũng đã tự động chuyển sang `Expired` khi insert/update gặp ngày hết hạn.
- Vì vậy trên một DB "sạch", procedure này có thể trả về `0`. Điều đó là bình thường và vẫn đúng thiết kế.
- Với bộ sample hiện tại:
  - `ma_hop_dong = 9201` đang `Active` nhưng `ngay_ket_thuc = 2026-12-31`, nên chưa hết hạn
  - `ma_hop_dong = 9202` đã quá hạn nhưng `trang_thai` đã là `Expired` sẵn
- Cách nói ngắn gọn với giảng viên: procedure này là "batch safety net" để dọn dữ liệu cũ chưa đồng bộ; còn trạng thái chuẩn hằng ngày đã được trigger giữ sẵn

Query demo:

```sql
USE warehouse_db;

SELECT
  ma_hop_dong,
  ma_khach_hang,
  ma_kho,
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
```

Kỳ vọng:
- Với bộ sample hiện tại, kết quả thường là `so_hop_dong_het_han = 0`.
- Đây không phải lỗi; nó chứng minh rằng trigger đã giữ trạng thái hợp đồng nhất quán từ trước.
- Nếu muốn demo một procedure có thay đổi dữ liệu nhìn thấy ngay, chuyển sang `procedure_hoan_tat_phieu_nhap()` hoặc `procedure_hoan_tat_phieu_xuat()`.

### 4.2. [PROCEDURE] `procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien(IN tham_so_ma_quan_tri_vien INT)`

Nó làm gì:
- Đọc từ `view_khach_thue_hien_tai`
- Lọc theo `ma_quan_tri_vien`
- Sắp xếp theo `ngay_ket_thuc`, `ten_khach_hang`, `ten_kho`

Tác dụng:
- Cho quan_tri_vien xem nhanh danh sách khách đang thuê kho thuộc quyền quản lý của mình

Mục đích nghiệp vụ:
- Phục vụ màn hình quản lý khách thuê hiện tại của quan_tri_vien

Query demo:

```sql
USE warehouse_db;

SET @ma_quan_tri_vien = (
  SELECT ma_quan_tri_vien
  FROM quan_tri_vien
  WHERE ten_dang_nhap = 'admin1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien(@ma_quan_tri_vien);
```

Nếu chưa có sample account:

```sql
SELECT ma_quan_tri_vien, ten_quan_tri_vien, ten_dang_nhap
FROM quan_tri_vien
ORDER BY ma_quan_tri_vien;
```

### 4.3. [PROCEDURE] `procedure_lay_gia_tri_ton_kho_khach_hang(IN tham_so_ma_khach_hang INT)`

Nó làm gì:
- Gọi function `function_gia_tri_ton_kho_cua_khach_hang`
- Trả về `ma_khach_hang` và `tong_gia_tri_ton_kho`

Tác dụng:
- Đóng gói phép tính tổng giá trị tồn kho thành 1 lệnh `CALL`

Mục đích nghiệp vụ:
- Phục vụ báo cáo tài sản hàng hóa của từng khách hàng

Query demo:

```sql
USE warehouse_db;

SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_gia_tri_ton_kho_khach_hang(@ma_khach_hang);
```

Nếu chưa có sample account:

```sql
SELECT ma_khach_hang, ten_khach_hang, ten_dang_nhap
FROM khach_hang
ORDER BY ma_khach_hang;
```

### 4.4. [PROCEDURE] `procedure_lay_lo_hang_sap_het_han(IN tham_so_ma_khach_hang INT, IN tham_so_so_ngay_toi INT)`

Nó làm gì:
- Đọc từ `view_lo_hang_sap_het_han`
- Lọc theo `ma_khach_hang`
- Chỉ lấy các lô có `so_ngay_con_lai` từ `0` đến `tham_so_so_ngay_toi`
- Nếu `tham_so_so_ngay_toi` là `NULL` thì mặc định dùng `30`

Tác dụng:
- Tạo danh sách cảnh báo hàng sắp hết hạn theo khách hàng

Mục đích nghiệp vụ:
- Giúp khách hoặc quan_tri_vien xử lý tồn kho gần hết hạn trước khi bị hư hỏng

Query demo:

```sql
USE warehouse_db;

SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_lo_hang_sap_het_han(@ma_khach_hang, 180);
```

Gợi ý:
- Dùng `180` ngày để dễ thấy dữ liệu mẫu hơn.
- Nếu muốn đúng ý nghĩa "sắp hết hạn", dùng `30`.

### 4.5. [PROCEDURE] `procedure_lay_san_pham_xuat_nhieu_nhat(IN tham_so_ma_khach_hang INT, IN tham_so_nam INT, IN tham_so_thang INT, IN tham_so_gioi_han INT)`

Nó làm gì:
- Đọc từ `view_xuat_hang_theo_thang`
- Lọc theo khách hàng, năm, tháng
- Gom nhóm theo sản phẩm
- Sắp xếp theo `tong_so_luong_xuat` rồi `tong_doanh_thu`
- Nếu `tham_so_gioi_han = 0` hoặc `NULL` thì mặc định lấy `10`

Tác dụng:
- Tạo báo cáo top sản phẩm xuất nhiều nhất trong tháng

Mục đích nghiệp vụ:
- Hỗ trợ phân tích bán hàng và mức độ luân chuyển hàng hóa

Query demo:

```sql
USE warehouse_db;

SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_san_pham_xuat_nhieu_nhat(@ma_khach_hang, 2026, 4, 5);
```

### 4.6. [PROCEDURE] `procedure_hoan_tat_phieu_nhap(IN tham_so_ma_phieu_nhap INT)`

Nó làm gì:
- Kiểm tra phiếu nhập có tồn tại hay không
- Chặn hoàn tất nếu phiếu đã `Cancelled`
- Chặn hoàn tất nếu phiếu không có detail
- Đổi trang_thai sang `Completed`
- Trả lại bản ghi `phieu_nhap` sau khi cập nhật

Điểm quan trọng để trình bày:
- Procedure này không tự cộng tồn kho bằng câu `UPDATE ton_kho`
- Nó chỉ đổi trạng thái phiếu
- Sau đó trigger `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_nhap` sẽ tự cộng tồn kho

Tác dụng:
- Biến thao tác "hoàn tất phiếu nhập" thành một lệnh nghiệp vụ chuẩn

Mục đích nghiệp vụ:
- Chỉ khi phiếu nhập được xác nhận hoàn tất thì hàng mới được ghi nhận vào tồn kho

Demo an toàn với dữ liệu mẫu:
- `sample_data.sql` tạo sẵn phiếu nhập `9802` ở trạng thái `Draft`
- Phiếu này có detail là batch `SPK-DRAFT-2026`

Query demo trước khi gọi procedure:

```sql
USE warehouse_db;

SELECT ma_phieu_nhap, ma_kho, ma_nha_cung_cap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT *
FROM chi_tiet_phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9701
  AND so_lo = 'SPK-DRAFT-2026';
```

Gọi procedure:

```sql
CALL procedure_hoan_tat_phieu_nhap(9802);
```

Query kiểm tra sau khi gọi:

```sql
SELECT ma_phieu_nhap, ma_kho, ma_nha_cung_cap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9701
  AND so_lo = 'SPK-DRAFT-2026';
```

Kỳ vọng:
- `phieu_nhap.trang_thai` đổi từ `Draft` sang `Completed`
- `ton_kho` xuất hiện thêm batch `SPK-DRAFT-2026` hoặc tăng số lượng nếu batch đã tồn tại

Để demo an toàn:
- nên chạy trong transaction rồi `ROLLBACK`
- hoặc reload lại `sample_data.sql`

### 4.7. [PROCEDURE] `procedure_hoan_tat_phieu_xuat(IN tham_so_ma_phieu_xuat INT)`

Nó làm gì:
- Kiểm tra phiếu xuất có tồn tại hay không
- Chặn hoàn tất nếu phiếu đã `Cancelled`
- Chặn hoàn tất nếu phiếu không có detail
- Đổi trang_thai sang `Completed`
- Trả lại bản ghi `phieu_xuat` sau khi cập nhật

Điểm quan trọng để trình bày:
- Trước khi trang_thai đổi sang `Completed`, trigger `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_phieu_xuat` sẽ kiểm tra tồn kho có đủ hay không
- Sau khi trang_thai đổi thành công, trigger `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_xuat` sẽ tự trừ tồn kho

Tác dụng:
- Đóng gói thao tác hoàn tất phiếu xuất thành một lệnh nghiệp vụ chuẩn
- Tách phần "ra lệnh complete" khỏi phần "kiểm tra tồn và trừ kho", giúp luồng DB rõ ràng hơn

Mục đích nghiệp vụ:
- Không cho xuất vượt tồn và chỉ trừ kho khi phiếu thật sự hoàn tất

Demo an toàn với dữ liệu mẫu:
- `sample_data.sql` tạo sẵn phiếu xuất `9902` ở trạng thái `Draft`
- Phiếu này xuất `10` đơn vị batch `BUTTER-APR26` từ kho `9101`

Query demo trước khi gọi procedure:

```sql
USE warehouse_db;

SELECT ma_phieu_xuat, ma_kho, ma_nguoi_mua, trang_thai
FROM phieu_xuat
WHERE ma_phieu_xuat = 9902;

SELECT *
FROM chi_tiet_phieu_xuat
WHERE ma_phieu_xuat = 9902;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';
```

Gọi procedure:

```sql
CALL procedure_hoan_tat_phieu_xuat(9902);
```

Query kiểm tra sau khi gọi:

```sql
SELECT ma_phieu_xuat, ma_kho, ma_nguoi_mua, trang_thai
FROM phieu_xuat
WHERE ma_phieu_xuat = 9902;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';
```

Kỳ vọng:
- `phieu_xuat.trang_thai` đổi từ `Draft` sang `Completed`
- `ton_kho.so_luong` của batch `BUTTER-APR26` bị trừ đúng `10`

Để demo an toàn:
- nên chạy trong transaction rồi `ROLLBACK`
- hoặc reload lại `sample_data.sql`

## 5. Triggers

Các trigger trong project chia thành 5 nhóm: validate dữ liệu master, validate chi tiết nhập, đồng bộ tồn khi nhập, validate chi tiết xuất, và đồng bộ tồn khi xuất.

### 5.1. Nhóm trigger validate dữ liệu master

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trigger_kiem_tra_kho_truoc_khi_them` | `BEFORE INSERT` | `kho` | Trim tên kho, chặn tên rỗng, chặn `dien_tich <= 0` | Bảo đảm dữ liệu kho hợp lệ ngay từ lúc thêm mới |
| [TRIGGER] `trigger_kiem_tra_kho_truoc_khi_cap_nhat` | `BEFORE UPDATE` | `kho` | Trim tên kho, chặn tên rỗng, chặn `dien_tich <= 0` | Không cho cập nhật kho thành dữ liệu vô nghĩa |
| [TRIGGER] `trigger_kiem_tra_hop_dong_thue_truoc_khi_them` | `BEFORE INSERT` | `hop_dong_thue` | Chặn `ngay_ket_thuc < ngay_bat_dau`; nếu quá hạn thì tự đổi trang_thai sang `Expired` | Bảo đảm logic ngày tháng hợp đồng |
| [TRIGGER] `trigger_kiem_tra_hop_dong_thue_truoc_khi_cap_nhat` | `BEFORE UPDATE` | `hop_dong_thue` | Kiểm tra ngày hợp đồng; tự đổi `Pending/Active` quá hạn sang `Expired` | Giữ trạng thái hợp đồng luôn nhất quán |
| [TRIGGER] `trigger_kiem_tra_san_pham_truoc_khi_them` | `BEFORE INSERT` | `san_pham` | Trim tên hàng và đơn vị tính; chặn rỗng; chặn giá âm | Bảo vệ dữ liệu hàng hóa |
| [TRIGGER] `trigger_kiem_tra_san_pham_truoc_khi_cap_nhat` | `BEFORE UPDATE` | `san_pham` | Giống trigger insert nhưng áp dụng cho cập nhật | Không cho dữ liệu sản phẩm bị sai sau này |

### 5.2. Nhóm trigger validate phiếu nhập

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trigger_kiem_tra_ct_phieu_nhap_truoc_khi_them` | `BEFORE INSERT` | `chi_tiet_phieu_nhap` | Trim `so_lo`; chặn batch rỗng; chặn `so_luong <= 0`; chặn `gia_nhap < 0` | Bảo đảm dòng nhập kho hợp lệ |
| [TRIGGER] `trigger_kiem_tra_ct_phieu_nhap_truoc_khi_cap_nhat` | `BEFORE UPDATE` | `chi_tiet_phieu_nhap` | Kiểm tra lại toàn bộ dữ liệu của dòng detail khi cập nhật | Không cho sửa chi tiết nhập thành dữ liệu sai |

### 5.3. Nhóm trigger đồng bộ tồn kho khi nhập

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_nhap` | `AFTER UPDATE` | `phieu_nhap` | Chỉ khi phiếu đổi từ trạng thái chưa `Completed` sang `Completed` thì cộng tồn theo detail | Ghi nhận hàng vào tồn kho đúng lúc chứng từ nhập được hoàn tất |

Ý nghĩa trình bày:
- Nhóm này cho thấy nhập kho không phải chỉ là thêm dòng vào detail.
- Tồn kho chỉ được cộng khi phiếu nhập thật sự chuyển từ `Draft` sang `Completed`.

### 5.4. Nhóm trigger validate phiếu xuất

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trigger_kiem_tra_ct_phieu_xuat_truoc_khi_them` | `BEFORE INSERT` | `chi_tiet_phieu_xuat` | Trim `so_lo`; chặn batch rỗng; chặn `so_luong <= 0`; chặn `gia_ban < 0` | Bảo đảm dữ liệu dòng xuất kho hợp lệ |
| [TRIGGER] `trigger_kiem_tra_ct_phieu_xuat_truoc_khi_cap_nhat` | `BEFORE UPDATE` | `chi_tiet_phieu_xuat` | Kiểm tra lại detail khi sửa | Không cho dòng xuất thành dữ liệu sai |
| [TRIGGER] `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_phieu_xuat` | `BEFORE UPDATE` | `phieu_xuat` | Trước khi hoàn tất phiếu xuất, gom tổng số lượng cần xuất theo batch và kiểm tra tồn kho có đủ hay không | Chặn hoàn tất phiếu nếu kho không đủ hàng |

Ý nghĩa trình bày:
- Trigger `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_phieu_xuat` là lớp guard quan trọng nhất của luồng xuất kho ở tầng DB.
- Với flow hiện tại của project, phiếu `Draft` chỉ có thể đi tới `Completed` hoặc `Cancelled`, nên trigger này vẫn cần giữ lại để chặn trường hợp complete khi kho không đủ hàng.
- Nếu bỏ trigger này mà không chuyển check sang nơi khác, trigger `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_xuat` vẫn trừ kho và có thể làm dữ liệu tồn kho sai lệch.
### 5.5. Nhóm trigger đồng bộ tồn kho khi xuất

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_xuat` | `AFTER UPDATE` | `phieu_xuat` | Chỉ khi phiếu đổi từ trạng thái chưa `Completed` sang `Completed` thì trừ kho | Chỉ ghi nhận xuất kho khi chứng từ đã hoàn tất |

Ý nghĩa trình bày:
- Đây là phần thể hiện rõ nhất "DB tự xử lý nghiệp vụ".
- Java chỉ cần đổi trang_thai phiếu hoặc chỉnh detail.
- Trigger chịu trách nhiệm đồng bộ số lượng tồn thật trong `ton_kho`.

## 6. Hướng dẫn test từng object

Phần này dùng khi bạn muốn demo trực tiếp trong MySQL Workbench và giải thích cho giảng viên từng object hoạt động ra sao.

### 6.1. Chuẩn bị trước khi test

```sql
USE warehouse_db;
```

Nên chuẩn bị như sau:
- Nếu dữ liệu demo đã bị thay đổi nhiều, chạy lại [sample_data.sql](/d:/Working/IdeaProjects/DBMS-kho-rental-management-merge-check/database/sample_data.sql:1).
- Với các test chỉ để chứng minh trigger validate, nên dùng `START TRANSACTION;` rồi `ROLLBACK;` để không lưu dữ liệu.
- Với các test cần xem tồn kho tăng giảm, nên dùng `START TRANSACTION;` rồi `ROLLBACK;`.
- Không nên reset chỉ bằng cách đổi `trang_thai` từ `Completed` về `Draft`, vì trigger hiện chỉ xử lý chiều `Draft -> Completed`.

Các ID mẫu tiện dùng:
- `ma_kho = 9101`
- `ma_san_pham = 9701`, `9702`
- `ma_phieu_nhap = 9801` là phiếu nhập `Completed`
- `ma_phieu_nhap = 9802` là phiếu nhập `Draft`
- `ma_phieu_xuat = 9901` là phiếu xuất `Completed`
- `ma_phieu_xuat = 9902` là phiếu xuất `Draft`

Nên kiểm tra nhanh trạng thái mẫu trước khi test:

```sql
SELECT ma_phieu_nhap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap IN (9801, 9802);

SELECT ma_phieu_xuat, trang_thai
FROM phieu_xuat
WHERE ma_phieu_xuat IN (9901, 9902);
```

Nếu bạn vừa demo procedure bằng cách chạy thật ngoài transaction:
- nên reload lại `sample_data.sql`
- hoặc tự chỉnh cả `trang_thai` lẫn `ton_kho` về đúng trạng thái mẫu

### 6.2. Test từng view

#### 6.2.1. Test [VIEW] `view_khach_thue_hien_tai`

```sql
SELECT *
FROM view_khach_thue_hien_tai;
```

Kỳ vọng:
- Chỉ thấy hợp đồng `Active`
- `CURDATE()` phải nằm trong khoảng `ngay_bat_dau` đến `ngay_ket_thuc`

Test sâu hơn:

```sql
SET @ma_quan_tri_vien = (
  SELECT ma_quan_tri_vien
  FROM quan_tri_vien
  WHERE ten_dang_nhap = 'admin1@gmail.com'
  LIMIT 1
);

SELECT *
FROM view_khach_thue_hien_tai
WHERE ma_quan_tri_vien = @ma_quan_tri_vien;
```

#### 6.2.2. Test [VIEW] `view_tong_hop_ton_kho`

```sql
SELECT *
FROM view_tong_hop_ton_kho
ORDER BY tong_gia_tri_ton_kho DESC;
```

Kỳ vọng:
- Mỗi dòng là tổng hợp theo `khach_hang + kho + san_pham`
- `tong_so_luong` là tổng số lượng của tất cả batch cùng sản phẩm trong kho
- `tong_gia_tri_ton_kho = tong_so_luong * gia_hien_tai`

#### 6.2.3. Test [VIEW] `view_lo_hang_sap_het_han`

```sql
SELECT *
FROM view_lo_hang_sap_het_han
ORDER BY han_su_dung, ten_san_pham;
```

Kỳ vọng:
- Chỉ hiện batch có `han_su_dung`
- Chỉ hiện batch còn tồn `so_luong_hien_tai > 0`
- Có cột `so_ngay_con_lai` để biết còn bao nhiêu ngày

#### 6.2.4. Test [VIEW] `view_xuat_hang_theo_thang`

```sql
SELECT *
FROM view_xuat_hang_theo_thang
WHERE nam_xuat = 2026
  AND thang_xuat = 4
ORDER BY tong_so_luong_xuat DESC;
```

Kỳ vọng:
- Chỉ tính các phiếu xuất `Completed`
- Có `tong_so_luong_xuat` và `tong_doanh_thu` theo tháng

### 6.3. Test từng function

#### 6.3.1. Test [FUNCTION] `function_gia_tri_ton_kho_theo_lo`

```sql
SELECT function_gia_tri_ton_kho_theo_lo(9101, 9701, 'SPK-A-2026') AS gia_tri_ham;

SELECT i.so_luong * p.gia_hien_tai AS gia_tri_tu_tinh
FROM ton_kho i
JOIN san_pham p ON p.ma_san_pham = i.ma_san_pham
WHERE i.ma_kho = 9101
  AND i.ma_san_pham = 9701
  AND i.so_lo = 'SPK-A-2026';
```

Kỳ vọng:
- `gia_tri_ham` và `gia_tri_tu_tinh` phải bằng nhau

#### 6.3.2. Test [FUNCTION] `function_gia_tri_ton_kho_cua_khach_hang`

```sql
SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

SELECT function_gia_tri_ton_kho_cua_khach_hang(@ma_khach_hang) AS gia_tri_ham;

SELECT COALESCE(SUM(i.so_luong * p.gia_hien_tai), 0) AS gia_tri_tu_tinh
FROM ton_kho i
JOIN san_pham p ON p.ma_san_pham = i.ma_san_pham
WHERE p.ma_khach_hang = @ma_khach_hang
  AND p.da_xoa = FALSE;
```

Kỳ vọng:
- `gia_tri_ham` và `gia_tri_tu_tinh` phải bằng nhau

#### 6.3.3. Test [FUNCTION] `function_ton_kho_kha_dung`

```sql
SELECT function_ton_kho_kha_dung(9101, 9702, 'BUTTER-APR26') AS so_luong_ham;

SELECT COALESCE(so_luong, 0) AS so_luong_tu_tinh
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';
```

Kỳ vọng:
- `so_luong_ham` và `so_luong_tu_tinh` phải bằng nhau

### 6.4. Test từng stored procedure

#### 6.4.1. Test [PROCEDURE] `procedure_cap_nhat_hop_dong_thue_het_han()`

```sql
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
```

Kỳ vọng:
- Với sample hiện tại, `so_hop_dong_het_han = 0` là kết quả đúng
- Có thể giải thích ngay với giảng viên:
  - `9201` chưa hết hạn nên không bị đổi
  - `9202` đã quá hạn nhưng đã là `Expired` sẵn
  - trigger `trigger_kiem_tra_hop_dong_thue_truoc_khi_cap_nhat` đã giúp DB giữ trạng thái đồng bộ từ trước
- Nếu giảng viên muốn thấy một procedure làm dữ liệu thay đổi rõ ràng, chuyển ngay sang `6.4.6` hoặc `6.4.7`

#### 6.4.2. Test [PROCEDURE] `procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien`

```sql
SET @ma_quan_tri_vien = (
  SELECT ma_quan_tri_vien
  FROM quan_tri_vien
  WHERE ten_dang_nhap = 'admin1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_khach_thue_hien_tai_theo_quan_tri_vien(@ma_quan_tri_vien);
```

Kỳ vọng:
- Kết quả đúng với `SELECT * FROM view_khach_thue_hien_tai WHERE ma_quan_tri_vien = @ma_quan_tri_vien`

#### 6.4.3. Test [PROCEDURE] `procedure_lay_gia_tri_ton_kho_khach_hang`

```sql
SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_gia_tri_ton_kho_khach_hang(@ma_khach_hang);
```

Kỳ vọng:
- Trả về đúng tổng giá trị tồn kho của khách hàng đó

#### 6.4.4. Test [PROCEDURE] `procedure_lay_lo_hang_sap_het_han`

```sql
SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_lo_hang_sap_het_han(@ma_khach_hang, 180);
```

Kỳ vọng:
- Chỉ hiện các batch của đúng khách hàng
- `so_ngay_con_lai` nằm trong khoảng từ `0` đến `180`

#### 6.4.5. Test [PROCEDURE] `procedure_lay_san_pham_xuat_nhieu_nhat`

```sql
SET @ma_khach_hang = (
  SELECT ma_khach_hang
  FROM khach_hang
  WHERE ten_dang_nhap = 'customer1@gmail.com'
  LIMIT 1
);

CALL procedure_lay_san_pham_xuat_nhieu_nhat(@ma_khach_hang, 2026, 4, 5);
```

Kỳ vọng:
- Có tối đa `5` dòng
- Sắp xếp giảm dần theo `tong_so_luong_xuat`

#### 6.4.6. Test [PROCEDURE] `procedure_hoan_tat_phieu_nhap`

```sql
SELECT ma_phieu_nhap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9701
  AND so_lo = 'SPK-DRAFT-2026';

CALL procedure_hoan_tat_phieu_nhap(9802);

SELECT ma_phieu_nhap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9701
  AND so_lo = 'SPK-DRAFT-2026';
```

Kỳ vọng:
- Phiếu nhập đổi từ `Draft` sang `Completed`
- Batch `SPK-DRAFT-2026` được cộng vào `ton_kho`

Sau khi demo:
- nên `ROLLBACK` nếu bạn đang chạy trong transaction
- nếu đã chạy thật ngoài transaction thì reload lại `sample_data.sql`

#### 6.4.7. Test [PROCEDURE] `procedure_hoan_tat_phieu_xuat`

```sql
SELECT ma_phieu_xuat, trang_thai
FROM phieu_xuat
WHERE ma_phieu_xuat = 9902;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';

CALL procedure_hoan_tat_phieu_xuat(9902);

SELECT ma_phieu_xuat, trang_thai
FROM phieu_xuat
WHERE ma_phieu_xuat = 9902;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';
```

Kỳ vọng:
- Phiếu xuất đổi từ `Draft` sang `Completed`
- `ton_kho.so_luong` của `BUTTER-APR26` bị trừ đúng số lượng xuất

Sau khi demo:
- nên `ROLLBACK` nếu bạn đang chạy trong transaction
- nếu đã chạy thật ngoài transaction thì reload lại `sample_data.sql`

### 6.5. Test từng trigger

Phần này tập trung test trigger riêng lẻ, không đi qua service Java.

#### 6.5.1. Test [TRIGGER] `trigger_kiem_tra_kho_truoc_khi_them`

```sql
START TRANSACTION;

INSERT INTO kho (
  ma_kho, ten_kho, dia_chi, dien_tich, gia_thue, trang_thai, ma_quan_tri_vien
) VALUES (
  99901, '   ', 'Test dia_chi', -10, 1000000, 'Active',
  (SELECT ma_quan_tri_vien FROM quan_tri_vien ORDER BY ma_quan_tri_vien LIMIT 1)
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `kho name is required` hoặc `kho dien_tich must be greater than zero`

#### 6.5.2. Test [TRIGGER] `trigger_kiem_tra_kho_truoc_khi_cap_nhat`

```sql
START TRANSACTION;

UPDATE kho
SET ten_kho = '   '
WHERE ma_kho = 9101;

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `kho name is required`

#### 6.5.3. Test [TRIGGER] `trigger_kiem_tra_hop_dong_thue_truoc_khi_them`

```sql
START TRANSACTION;

INSERT INTO hop_dong_thue (
  ma_hop_dong, ma_khach_hang, ma_kho, ngay_bat_dau, ngay_ket_thuc,
  gia_thue, trang_thai, muc_dich, tao_luc
) VALUES (
  99901,
  (SELECT ma_khach_hang FROM khach_hang ORDER BY ma_khach_hang LIMIT 1),
  9101,
  '2026-12-31',
  '2026-01-01',
  12000000,
  'Active',
  'Trigger test',
  NOW()
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Ngay ket thuc hop dong phai lon hon hoac bang ngay bat dau`

#### 6.5.4. Test [TRIGGER] `trigger_kiem_tra_hop_dong_thue_truoc_khi_cap_nhat`

```sql
START TRANSACTION;

UPDATE hop_dong_thue
SET ngay_ket_thuc = DATE_SUB(ngay_bat_dau, INTERVAL 1 DAY)
WHERE ma_hop_dong = 9201;

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Ngay ket thuc hop dong phai lon hon hoac bang ngay bat dau`

Test thêm cho nhánh auto-expire:

```sql
START TRANSACTION;

UPDATE hop_dong_thue
SET trang_thai = 'Active',
    ngay_ket_thuc = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
WHERE ma_hop_dong = 9201;

SELECT ma_hop_dong, trang_thai, ngay_ket_thuc
FROM hop_dong_thue
WHERE ma_hop_dong = 9201;

ROLLBACK;
```

Kỳ vọng:
- `trang_thai` tự đổi thành `Expired`

#### 6.5.5. Test [TRIGGER] `trigger_kiem_tra_san_pham_truoc_khi_them`

```sql
START TRANSACTION;

INSERT INTO san_pham (
  ma_san_pham, ten_san_pham, gia_hien_tai, don_vi_tinh,
  ma_khach_hang, ma_danh_muc, da_xoa
) VALUES (
  99901, '   ', -1, '   ',
  (SELECT ma_khach_hang FROM khach_hang WHERE ten_dang_nhap = 'customer1@gmail.com' LIMIT 1),
  9401,
  FALSE
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi do tên rỗng, đơn vị tính rỗng, hoặc giá âm

#### 6.5.6. Test [TRIGGER] `trigger_kiem_tra_san_pham_truoc_khi_cap_nhat`

```sql
START TRANSACTION;

UPDATE san_pham
SET gia_hien_tai = -1
WHERE ma_san_pham = 9701;

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `san_pham current price cannot be negative`

#### 6.5.7. Test [TRIGGER] `trigger_kiem_tra_ct_phieu_nhap_truoc_khi_them`

```sql
START TRANSACTION;

INSERT INTO chi_tiet_phieu_nhap (
  ma_phieu_nhap, ma_san_pham, so_lo, so_luong, gia_nhap, han_su_dung
) VALUES (
  9802, 9701, '   ', 0, -1, NULL
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi do `so_lo` rỗng, `so_luong <= 0` hoặc `gia_nhap < 0`

#### 6.5.8. Test [TRIGGER] `trigger_kiem_tra_ct_phieu_nhap_truoc_khi_cap_nhat`

```sql
START TRANSACTION;

UPDATE chi_tiet_phieu_nhap
SET so_luong = 0
WHERE ma_phieu_nhap = 9802
  AND ma_san_pham = 9701
  AND so_lo = 'SPK-DRAFT-2026';

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `So luong phieu nhap phai lon hon 0`

#### 6.5.9. Test [TRIGGER] `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_nhap`

```sql
START TRANSACTION;

SELECT ma_phieu_nhap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9701
  AND so_lo = 'SPK-DRAFT-2026';

UPDATE phieu_nhap
SET trang_thai = 'Completed'
WHERE ma_phieu_nhap = 9802;

SELECT ma_phieu_nhap, trang_thai
FROM phieu_nhap
WHERE ma_phieu_nhap = 9802;

SELECT *
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9701
  AND so_lo = 'SPK-DRAFT-2026';

ROLLBACK;
```

Kỳ vọng:
- Sau `UPDATE`, tồn kho tăng lên hoặc xuất hiện mới batch `SPK-DRAFT-2026`

#### 6.5.11. Test [TRIGGER] `trigger_kiem_tra_ct_phieu_xuat_truoc_khi_them`

```sql
START TRANSACTION;

INSERT INTO chi_tiet_phieu_xuat (
  ma_phieu_xuat, ma_san_pham, so_lo, so_luong, gia_ban
) VALUES (
  9902, 9702, '   ', 0, -1
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi do batch rỗng, số lượng không hợp lệ, hoặc giá bán âm

#### 6.5.12. Test [TRIGGER] `trigger_kiem_tra_ct_phieu_xuat_truoc_khi_cap_nhat`

```sql
START TRANSACTION;

UPDATE chi_tiet_phieu_xuat
SET gia_ban = -1
WHERE ma_phieu_xuat = 9902
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Gia ban khong duoc am`

#### 6.5.13. Test [TRIGGER] `trigger_kiem_tra_ton_kho_truoc_khi_cap_nhat_phieu_xuat`

```sql
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
```

Kỳ vọng:
- Báo lỗi `Insufficient ton_kho to complete outbound issue`

#### 6.5.14. Test [TRIGGER] `trigger_cap_nhat_ton_kho_sau_khi_cap_nhat_phieu_xuat`

```sql
START TRANSACTION;

SELECT so_luong
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';

UPDATE phieu_xuat
SET trang_thai = 'Completed'
WHERE ma_phieu_xuat = 9902;

SELECT so_luong
FROM ton_kho
WHERE ma_kho = 9101
  AND ma_san_pham = 9702
  AND so_lo = 'BUTTER-APR26';

ROLLBACK;
```

Kỳ vọng:
- `ton_kho.so_luong` giảm đúng bằng số lượng của detail thuộc `ma_phieu_xuat = 9902`

## 7. Cách kể chuyện khi thuyết trình

Có thể trình bày theo logic sau:

1. `View` và `function` là phần đọc dữ liệu, tính toán và báo cáo.
2. `Procedure` là phần đóng gói nghiệp vụ thành các lệnh `CALL`.
3. `Trigger` là lớp tự vệ của database:
   - chặn dữ liệu sai
   - chặn xuất vượt tồn
   - tự cộng/trừ kho khi chứng từ hoàn tất

Một câu kết ngắn gọn để nói với giảng viên:
- "Mục tiêu của nhóm em là để MySQL không chỉ lưu dữ liệu mà còn thực thi một phần business rule cốt lõi, đặc biệt là quản lý tồn kho và bảo vệ toàn vẹn nghiệp vụ."






