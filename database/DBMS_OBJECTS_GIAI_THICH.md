# Giải thích View, Function, Procedure, Trigger

Tài liệu này giải thích các DBMS object trong [dbms_objects.sql](/d:/Working/IdeaProjects/DBMS-warehouse-rental-management-merge-check/database/dbms_objects.sql:1): chúng làm gì, có tác dụng gì, và được tạo ra để phục vụ mục đích nghiệp vụ nào.

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
- Nếu đã import [sample_data.sql](/d:/Working/IdeaProjects/DBMS-warehouse-rental-management-merge-check/database/sample_data.sql:1), có thể dùng trực tiếp các ID mẫu như `9101`, `9701`, `9702`, `9802`, `9902`.
- Với các procedure hoàn tất phiếu nhập/xuất, demo sẽ làm thay đổi dữ liệu thật trong DB demo.
- Với `sp_expire_lease_contracts()`, bộ sample hiện tại thường trả `0` vì dữ liệu quá hạn đã được đồng bộ sang `Expired` sẵn.

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
| [VIEW] `vw_current_tenants` | Join `lease_contract`, `customer`, `warehouse`, `admin`; chỉ lấy hợp đồng `Active` và còn hiệu lực theo ngày hiện tại | Cho ra danh sách khách thuê đang sử dụng kho | Hỗ trợ admin xem khách thuê hiện tại theo kho mình quản lý |
| [VIEW] `vw_inventory_summary` | Tổng hợp tồn kho theo khách hàng, kho, sản phẩm, category; tính `total_quantity`, `total_inventory_value`, `batch_count` | Biến dữ liệu tồn kho chi tiết theo batch thành báo cáo tổng hợp dễ đọc | Hỗ trợ dashboard tồn kho và báo cáo giá trị hàng hóa |
| [VIEW] `vw_expiring_batches` | Lấy các lô nhập đã hoàn tất, nối với `inventory` để biết số lượng hiện còn, hạn dùng và số ngày còn lại | Theo dõi lô sắp hết hạn nhưng chỉ tính phần còn tồn thật | Hỗ trợ cảnh báo hàng sắp hết hạn và xử lý hàng tồn |
| [VIEW] `vw_monthly_product_exports` | Tổng hợp lượng xuất và doanh thu theo tháng từ `outbound_issue` và `outbound_issue_detail` | Cho ra dữ liệu nền để lọc top sản phẩm xuất nhiều | Hỗ trợ báo cáo bán hàng/xuất kho theo tháng |

### Query nhanh để demo view

```sql
USE warehouse_db;

SELECT * FROM vw_current_tenants;

SELECT * 
FROM vw_inventory_summary
ORDER BY total_inventory_value DESC;

SELECT *
FROM vw_expiring_batches
ORDER BY expiry_date, product_name;

SELECT *
FROM vw_monthly_product_exports
WHERE export_year = 2026
  AND export_month = 4
ORDER BY total_quantity_exported DESC;
```

## 3. Functions

| Function | Input | Output | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [FUNCTION] `fn_inventory_batch_value` | `warehouse_id`, `product_id`, `batch_no` | `DECIMAL(18,2)` | Tính giá trị tồn kho của đúng một lô hàng trong một kho | Dùng khi cần biết giá trị tiền của từng batch |
| [FUNCTION] `fn_customer_inventory_value` | `customer_id` | `DECIMAL(18,2)` | Tính tổng giá trị tồn kho của toàn bộ sản phẩm thuộc một khách hàng | Dùng cho báo cáo tổng tài sản lưu kho của khách |
| [FUNCTION] `fn_available_inventory` | `warehouse_id`, `product_id`, `batch_no` | `INT` | Trả về số lượng tồn khả dụng hiện tại của một batch | Dùng trong trigger/procedure để kiểm tra tồn kho trước khi hoàn tất phiếu xuất |

### Query nhanh để demo function

```sql
USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

SELECT fn_inventory_batch_value(9101, 9701, 'SPK-A-2026') AS batch_value;

SELECT fn_customer_inventory_value(@customer_id) AS customer_inventory_value;

SELECT fn_available_inventory(9101, 9702, 'BUTTER-APR26') AS available_qty;
```

## 4. Stored Procedures

Phần này là quan trọng nhất khi demo vì giảng viên sẽ nhìn thấy rõ DB xử lý nghiệp vụ bằng `CALL`.

Gợi ý demo procedure theo thứ tự an toàn:
- Muốn ra dữ liệu ngay, ít rủi ro: `sp_get_current_tenants_by_admin`, `sp_get_customer_inventory_value`, `sp_get_expiring_batches`, `sp_get_top_exported_products`
- Muốn thấy dữ liệu thay đổi rõ ràng trước/sau: `sp_complete_inbound_receipt`, `sp_complete_outbound_issue`
- `sp_expire_lease_contracts()` nên demo theo hướng giải thích kiến trúc, vì trên bộ sample hiện tại nó thường trả `0` và đó là kết quả đúng

Quan hệ quan trọng giữa procedure và trigger trong luồng nhập/xuất:
- `sp_complete_inbound_receipt()` chỉ đổi trạng thái phiếu nhập sang `Completed`; trigger `trg_inbound_receipt_au_inventory` mới là phần tự cộng tồn kho.
- `sp_complete_outbound_issue()` chỉ đổi trạng thái phiếu xuất sang `Completed`; trigger `trg_outbound_issue_bu_check_inventory` chặn xuất vượt tồn trước khi update, còn trigger `trg_outbound_issue_au_inventory` mới là phần tự trừ tồn kho.
- Vì vậy procedure là "lệnh nghiệp vụ", còn trigger là "phản ứng tự động của database" sau khi trạng thái đổi.

### Query hỗ trợ tìm ID demo

Nếu dữ liệu mẫu của bạn không còn đúng trạng thái ban đầu, có thể dùng các query này để tìm record phù hợp:

```sql
USE warehouse_db;

SELECT admin_id, admin_name, user_name
FROM admin
ORDER BY admin_id;

SELECT customer_id, customer_name, user_name
FROM customer
ORDER BY customer_id;

SELECT receipt_id, warehouse_id, status
FROM inbound_receipt
ORDER BY receipt_id;

SELECT issue_id, warehouse_id, status
FROM outbound_issue
ORDER BY issue_id;

SELECT contract_id, customer_id, warehouse_id, status, end_date
FROM lease_contract
ORDER BY contract_id;
```

### 4.1. [PROCEDURE] `sp_expire_lease_contracts()`

Nó làm gì:
- Tìm các hợp đồng có `end_date < CURDATE()`
- Nếu status đang là `Pending` hoặc `Active` thì đổi sang `Expired`
- Trả về số dòng vừa được cập nhật qua cột `expired_contracts`

Tác dụng:
- Đảm bảo hợp đồng quá hạn không tiếp tục bị xem là còn hiệu lực
- Là một thủ tục bảo trì dữ liệu hàng loạt

Mục đích nghiệp vụ:
- Tự động chuẩn hóa trạng thái hợp đồng theo thời gian

Lưu ý:
- Trong project này, trigger ở `lease_contract` cũng đã tự động chuyển sang `Expired` khi insert/update gặp ngày hết hạn.
- Vì vậy trên một DB "sạch", procedure này có thể trả về `0`. Điều đó là bình thường và vẫn đúng thiết kế.
- Với bộ sample hiện tại:
  - `contract_id = 9201` đang `Active` nhưng `end_date = 2026-12-31`, nên chưa hết hạn
  - `contract_id = 9202` đã quá hạn nhưng `status` đã là `Expired` sẵn
- Cách nói ngắn gọn với giảng viên: procedure này là "batch safety net" để dọn dữ liệu cũ chưa đồng bộ; còn trạng thái chuẩn hằng ngày đã được trigger giữ sẵn

Query demo:

```sql
USE warehouse_db;

SELECT
  contract_id,
  customer_id,
  warehouse_id,
  status,
  start_date,
  end_date,
  CASE
    WHEN end_date < CURDATE()
     AND status IN ('Pending', 'Active')
    THEN 'will be updated by procedure'
    ELSE 'not affected'
  END AS procedure_effect
FROM lease_contract
ORDER BY contract_id;

CALL sp_expire_lease_contracts();
```

Kỳ vọng:
- Với bộ sample hiện tại, kết quả thường là `expired_contracts = 0`.
- Đây không phải lỗi; nó chứng minh rằng trigger đã giữ trạng thái hợp đồng nhất quán từ trước.
- Nếu muốn demo một procedure có thay đổi dữ liệu nhìn thấy ngay, chuyển sang `sp_complete_inbound_receipt()` hoặc `sp_complete_outbound_issue()`.

### 4.2. [PROCEDURE] `sp_get_current_tenants_by_admin(IN p_admin_id INT)`

Nó làm gì:
- Đọc từ `vw_current_tenants`
- Lọc theo `admin_id`
- Sắp xếp theo `end_date`, `customer_name`, `warehouse_name`

Tác dụng:
- Cho admin xem nhanh danh sách khách đang thuê kho thuộc quyền quản lý của mình

Mục đích nghiệp vụ:
- Phục vụ màn hình quản lý khách thuê hiện tại của admin

Query demo:

```sql
USE warehouse_db;

SET @admin_id = (
  SELECT admin_id
  FROM admin
  WHERE user_name = 'admin1@gmail.com'
  LIMIT 1
);

CALL sp_get_current_tenants_by_admin(@admin_id);
```

Nếu chưa có sample account:

```sql
SELECT admin_id, admin_name, user_name
FROM admin
ORDER BY admin_id;
```

### 4.3. [PROCEDURE] `sp_get_customer_inventory_value(IN p_customer_id INT)`

Nó làm gì:
- Gọi function `fn_customer_inventory_value`
- Trả về `customer_id` và `total_inventory_value`

Tác dụng:
- Đóng gói phép tính tổng giá trị tồn kho thành 1 lệnh `CALL`

Mục đích nghiệp vụ:
- Phục vụ báo cáo tài sản hàng hóa của từng khách hàng

Query demo:

```sql
USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_customer_inventory_value(@customer_id);
```

Nếu chưa có sample account:

```sql
SELECT customer_id, customer_name, user_name
FROM customer
ORDER BY customer_id;
```

### 4.4. [PROCEDURE] `sp_get_expiring_batches(IN p_customer_id INT, IN p_days_ahead INT)`

Nó làm gì:
- Đọc từ `vw_expiring_batches`
- Lọc theo `customer_id`
- Chỉ lấy các lô có `days_until_expiry` từ `0` đến `p_days_ahead`
- Nếu `p_days_ahead` là `NULL` thì mặc định dùng `30`

Tác dụng:
- Tạo danh sách cảnh báo hàng sắp hết hạn theo khách hàng

Mục đích nghiệp vụ:
- Giúp khách hoặc admin xử lý tồn kho gần hết hạn trước khi bị hư hỏng

Query demo:

```sql
USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_expiring_batches(@customer_id, 180);
```

Gợi ý:
- Dùng `180` ngày để dễ thấy dữ liệu mẫu hơn.
- Nếu muốn đúng ý nghĩa "sắp hết hạn", dùng `30`.

### 4.5. [PROCEDURE] `sp_get_top_exported_products(IN p_customer_id INT, IN p_year INT, IN p_month INT, IN p_limit INT)`

Nó làm gì:
- Đọc từ `vw_monthly_product_exports`
- Lọc theo khách hàng, năm, tháng
- Gom nhóm theo sản phẩm
- Sắp xếp theo `total_quantity_exported` rồi `total_revenue`
- Nếu `p_limit = 0` hoặc `NULL` thì mặc định lấy `10`

Tác dụng:
- Tạo báo cáo top sản phẩm xuất nhiều nhất trong tháng

Mục đích nghiệp vụ:
- Hỗ trợ phân tích bán hàng và mức độ luân chuyển hàng hóa

Query demo:

```sql
USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_top_exported_products(@customer_id, 2026, 4, 5);
```

### 4.6. [PROCEDURE] `sp_complete_inbound_receipt(IN p_receipt_id INT)`

Nó làm gì:
- Kiểm tra phiếu nhập có tồn tại hay không
- Chặn hoàn tất nếu phiếu đã `Cancelled`
- Chặn hoàn tất nếu phiếu không có detail
- Đổi status sang `Completed`
- Trả lại bản ghi `inbound_receipt` sau khi cập nhật

Điểm quan trọng để trình bày:
- Procedure này không tự cộng tồn kho bằng câu `UPDATE inventory`
- Nó chỉ đổi trạng thái phiếu
- Sau đó trigger `trg_inbound_receipt_au_inventory` sẽ tự cộng tồn kho

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

SELECT receipt_id, warehouse_id, supplier_id, status
FROM inbound_receipt
WHERE receipt_id = 9802;

SELECT *
FROM inbound_receipt_detail
WHERE receipt_id = 9802;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9701
  AND batch_no = 'SPK-DRAFT-2026';
```

Gọi procedure:

```sql
CALL sp_complete_inbound_receipt(9802);
```

Query kiểm tra sau khi gọi:

```sql
SELECT receipt_id, warehouse_id, supplier_id, status
FROM inbound_receipt
WHERE receipt_id = 9802;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9701
  AND batch_no = 'SPK-DRAFT-2026';
```

Kỳ vọng:
- `inbound_receipt.status` đổi từ `Draft` sang `Completed`
- `inventory` xuất hiện thêm batch `SPK-DRAFT-2026` hoặc tăng số lượng nếu batch đã tồn tại

Để demo an toàn:
- nên chạy trong transaction rồi `ROLLBACK`
- hoặc reload lại `sample_data.sql`

### 4.7. [PROCEDURE] `sp_complete_outbound_issue(IN p_issue_id INT)`

Nó làm gì:
- Kiểm tra phiếu xuất có tồn tại hay không
- Chặn hoàn tất nếu phiếu đã `Cancelled`
- Chặn hoàn tất nếu phiếu không có detail
- Đổi status sang `Completed`
- Trả lại bản ghi `outbound_issue` sau khi cập nhật

Điểm quan trọng để trình bày:
- Trước khi status đổi sang `Completed`, trigger `trg_outbound_issue_bu_check_inventory` sẽ kiểm tra tồn kho có đủ hay không
- Sau khi status đổi thành công, trigger `trg_outbound_issue_au_inventory` sẽ tự trừ tồn kho

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

SELECT issue_id, warehouse_id, buyer_id, status
FROM outbound_issue
WHERE issue_id = 9902;

SELECT *
FROM outbound_issue_detail
WHERE issue_id = 9902;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';
```

Gọi procedure:

```sql
CALL sp_complete_outbound_issue(9902);
```

Query kiểm tra sau khi gọi:

```sql
SELECT issue_id, warehouse_id, buyer_id, status
FROM outbound_issue
WHERE issue_id = 9902;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';
```

Kỳ vọng:
- `outbound_issue.status` đổi từ `Draft` sang `Completed`
- `inventory.quantity` của batch `BUTTER-APR26` bị trừ đúng `10`

Để demo an toàn:
- nên chạy trong transaction rồi `ROLLBACK`
- hoặc reload lại `sample_data.sql`

## 5. Triggers

Các trigger trong project chia thành 5 nhóm: validate dữ liệu master, validate chi tiết nhập, đồng bộ tồn khi nhập, validate chi tiết xuất, và đồng bộ tồn khi xuất.

### 5.1. Nhóm trigger validate dữ liệu master

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trg_warehouse_bi_validate` | `BEFORE INSERT` | `warehouse` | Trim tên kho, chặn tên rỗng, chặn `area <= 0` | Bảo đảm dữ liệu kho hợp lệ ngay từ lúc thêm mới |
| [TRIGGER] `trg_warehouse_bu_validate` | `BEFORE UPDATE` | `warehouse` | Trim tên kho, chặn tên rỗng, chặn `area <= 0` | Không cho cập nhật kho thành dữ liệu vô nghĩa |
| [TRIGGER] `trg_lease_contract_bi_validate` | `BEFORE INSERT` | `lease_contract` | Chặn `end_date < start_date`; nếu quá hạn thì tự đổi status sang `Expired` | Bảo đảm logic ngày tháng hợp đồng |
| [TRIGGER] `trg_lease_contract_bu_validate` | `BEFORE UPDATE` | `lease_contract` | Kiểm tra ngày hợp đồng; tự đổi `Pending/Active` quá hạn sang `Expired` | Giữ trạng thái hợp đồng luôn nhất quán |
| [TRIGGER] `trg_product_bi_validate` | `BEFORE INSERT` | `product` | Trim tên hàng và đơn vị tính; chặn rỗng; chặn giá âm | Bảo vệ dữ liệu hàng hóa |
| [TRIGGER] `trg_product_bu_validate` | `BEFORE UPDATE` | `product` | Giống trigger insert nhưng áp dụng cho cập nhật | Không cho dữ liệu sản phẩm bị sai sau này |

### 5.2. Nhóm trigger validate phiếu nhập

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trg_inbound_detail_bi_validate` | `BEFORE INSERT` | `inbound_receipt_detail` | Trim `batch_no`; chặn batch rỗng; chặn `quantity <= 0`; chặn `import_price < 0` | Bảo đảm dòng nhập kho hợp lệ |
| [TRIGGER] `trg_inbound_detail_bu_validate` | `BEFORE UPDATE` | `inbound_receipt_detail` | Kiểm tra lại toàn bộ dữ liệu của dòng detail khi cập nhật | Không cho sửa chi tiết nhập thành dữ liệu sai |

### 5.3. Nhóm trigger đồng bộ tồn kho khi nhập

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trg_inbound_receipt_au_inventory` | `AFTER UPDATE` | `inbound_receipt` | Chỉ khi phiếu đổi từ trạng thái chưa `Completed` sang `Completed` thì cộng tồn theo detail | Ghi nhận hàng vào tồn kho đúng lúc chứng từ nhập được hoàn tất |

Ý nghĩa trình bày:
- Nhóm này cho thấy nhập kho không phải chỉ là thêm dòng vào detail.
- Tồn kho chỉ được cộng khi phiếu nhập thật sự chuyển từ `Draft` sang `Completed`.

### 5.4. Nhóm trigger validate phiếu xuất

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trg_outbound_detail_bi_validate` | `BEFORE INSERT` | `outbound_issue_detail` | Trim `batch_no`; chặn batch rỗng; chặn `quantity <= 0`; chặn `selling_price < 0` | Bảo đảm dữ liệu dòng xuất kho hợp lệ |
| [TRIGGER] `trg_outbound_detail_bu_validate` | `BEFORE UPDATE` | `outbound_issue_detail` | Kiểm tra lại detail khi sửa | Không cho dòng xuất thành dữ liệu sai |
| [TRIGGER] `trg_outbound_issue_bu_check_inventory` | `BEFORE UPDATE` | `outbound_issue` | Trước khi hoàn tất phiếu xuất, gom tổng số lượng cần xuất theo batch và kiểm tra tồn kho có đủ hay không | Chặn hoàn tất phiếu nếu kho không đủ hàng |

Ý nghĩa trình bày:
- Trigger `trg_outbound_issue_bu_check_inventory` là lớp guard quan trọng nhất của luồng xuất kho ở tầng DB.
- Với flow hiện tại của project, phiếu `Draft` chỉ có thể đi tới `Completed` hoặc `Cancelled`, nên trigger này vẫn cần giữ lại để chặn trường hợp complete khi kho không đủ hàng.
- Nếu bỏ trigger này mà không chuyển check sang nơi khác, trigger `trg_outbound_issue_au_inventory` vẫn trừ kho và có thể làm dữ liệu tồn kho sai lệch.
### 5.5. Nhóm trigger đồng bộ tồn kho khi xuất

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| [TRIGGER] `trg_outbound_issue_au_inventory` | `AFTER UPDATE` | `outbound_issue` | Chỉ khi phiếu đổi từ trạng thái chưa `Completed` sang `Completed` thì trừ kho | Chỉ ghi nhận xuất kho khi chứng từ đã hoàn tất |

Ý nghĩa trình bày:
- Đây là phần thể hiện rõ nhất "DB tự xử lý nghiệp vụ".
- Java chỉ cần đổi status phiếu hoặc chỉnh detail.
- Trigger chịu trách nhiệm đồng bộ số lượng tồn thật trong `inventory`.

## 6. Hướng dẫn test từng object

Phần này dùng khi bạn muốn demo trực tiếp trong MySQL Workbench và giải thích cho giảng viên từng object hoạt động ra sao.

### 6.1. Chuẩn bị trước khi test

```sql
USE warehouse_db;
```

Nên chuẩn bị như sau:
- Nếu dữ liệu demo đã bị thay đổi nhiều, chạy lại [sample_data.sql](/d:/Working/IdeaProjects/DBMS-warehouse-rental-management-merge-check/database/sample_data.sql:1).
- Với các test chỉ để chứng minh trigger validate, nên dùng `START TRANSACTION;` rồi `ROLLBACK;` để không lưu dữ liệu.
- Với các test cần xem tồn kho tăng giảm, nên dùng `START TRANSACTION;` rồi `ROLLBACK;`.
- Không nên reset chỉ bằng cách đổi `status` từ `Completed` về `Draft`, vì trigger hiện chỉ xử lý chiều `Draft -> Completed`.

Các ID mẫu tiện dùng:
- `warehouse_id = 9101`
- `product_id = 9701`, `9702`
- `receipt_id = 9801` là phiếu nhập `Completed`
- `receipt_id = 9802` là phiếu nhập `Draft`
- `issue_id = 9901` là phiếu xuất `Completed`
- `issue_id = 9902` là phiếu xuất `Draft`

Nên kiểm tra nhanh trạng thái mẫu trước khi test:

```sql
SELECT receipt_id, status
FROM inbound_receipt
WHERE receipt_id IN (9801, 9802);

SELECT issue_id, status
FROM outbound_issue
WHERE issue_id IN (9901, 9902);
```

Nếu bạn vừa demo procedure bằng cách chạy thật ngoài transaction:
- nên reload lại `sample_data.sql`
- hoặc tự chỉnh cả `status` lẫn `inventory` về đúng trạng thái mẫu

### 6.2. Test từng view

#### 6.2.1. Test [VIEW] `vw_current_tenants`

```sql
SELECT *
FROM vw_current_tenants;
```

Kỳ vọng:
- Chỉ thấy hợp đồng `Active`
- `CURDATE()` phải nằm trong khoảng `start_date` đến `end_date`

Test sâu hơn:

```sql
SET @admin_id = (
  SELECT admin_id
  FROM admin
  WHERE user_name = 'admin1@gmail.com'
  LIMIT 1
);

SELECT *
FROM vw_current_tenants
WHERE admin_id = @admin_id;
```

#### 6.2.2. Test [VIEW] `vw_inventory_summary`

```sql
SELECT *
FROM vw_inventory_summary
ORDER BY total_inventory_value DESC;
```

Kỳ vọng:
- Mỗi dòng là tổng hợp theo `customer + warehouse + product`
- `total_quantity` là tổng số lượng của tất cả batch cùng sản phẩm trong kho
- `total_inventory_value = total_quantity * current_price`

#### 6.2.3. Test [VIEW] `vw_expiring_batches`

```sql
SELECT *
FROM vw_expiring_batches
ORDER BY expiry_date, product_name;
```

Kỳ vọng:
- Chỉ hiện batch có `expiry_date`
- Chỉ hiện batch còn tồn `current_quantity > 0`
- Có cột `days_until_expiry` để biết còn bao nhiêu ngày

#### 6.2.4. Test [VIEW] `vw_monthly_product_exports`

```sql
SELECT *
FROM vw_monthly_product_exports
WHERE export_year = 2026
  AND export_month = 4
ORDER BY total_quantity_exported DESC;
```

Kỳ vọng:
- Chỉ tính các phiếu xuất `Completed`
- Có `total_quantity_exported` và `total_revenue` theo tháng

### 6.3. Test từng function

#### 6.3.1. Test [FUNCTION] `fn_inventory_batch_value`

```sql
SELECT fn_inventory_batch_value(9101, 9701, 'SPK-A-2026') AS fn_value;

SELECT i.quantity * p.current_price AS manual_value
FROM inventory i
JOIN product p ON p.product_id = i.product_id
WHERE i.warehouse_id = 9101
  AND i.product_id = 9701
  AND i.batch_no = 'SPK-A-2026';
```

Kỳ vọng:
- `fn_value` và `manual_value` phải bằng nhau

#### 6.3.2. Test [FUNCTION] `fn_customer_inventory_value`

```sql
SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

SELECT fn_customer_inventory_value(@customer_id) AS fn_value;

SELECT COALESCE(SUM(i.quantity * p.current_price), 0) AS manual_value
FROM inventory i
JOIN product p ON p.product_id = i.product_id
WHERE p.customer_id = @customer_id
  AND p.is_deleted = FALSE;
```

Kỳ vọng:
- `fn_value` và `manual_value` phải bằng nhau

#### 6.3.3. Test [FUNCTION] `fn_available_inventory`

```sql
SELECT fn_available_inventory(9101, 9702, 'BUTTER-APR26') AS fn_qty;

SELECT COALESCE(quantity, 0) AS manual_qty
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';
```

Kỳ vọng:
- `fn_qty` và `manual_qty` phải bằng nhau

### 6.4. Test từng stored procedure

#### 6.4.1. Test [PROCEDURE] `sp_expire_lease_contracts()`

```sql
SELECT
  contract_id,
  status,
  start_date,
  end_date,
  CASE
    WHEN end_date < CURDATE()
     AND status IN ('Pending', 'Active')
    THEN 'will be updated by procedure'
    ELSE 'not affected'
  END AS procedure_effect
FROM lease_contract
ORDER BY contract_id;

CALL sp_expire_lease_contracts();
```

Kỳ vọng:
- Với sample hiện tại, `expired_contracts = 0` là kết quả đúng
- Có thể giải thích ngay với giảng viên:
  - `9201` chưa hết hạn nên không bị đổi
  - `9202` đã quá hạn nhưng đã là `Expired` sẵn
  - trigger `trg_lease_contract_bu_validate` đã giúp DB giữ trạng thái đồng bộ từ trước
- Nếu giảng viên muốn thấy một procedure làm dữ liệu thay đổi rõ ràng, chuyển ngay sang `6.4.6` hoặc `6.4.7`

#### 6.4.2. Test [PROCEDURE] `sp_get_current_tenants_by_admin`

```sql
SET @admin_id = (
  SELECT admin_id
  FROM admin
  WHERE user_name = 'admin1@gmail.com'
  LIMIT 1
);

CALL sp_get_current_tenants_by_admin(@admin_id);
```

Kỳ vọng:
- Kết quả đúng với `SELECT * FROM vw_current_tenants WHERE admin_id = @admin_id`

#### 6.4.3. Test [PROCEDURE] `sp_get_customer_inventory_value`

```sql
SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_customer_inventory_value(@customer_id);
```

Kỳ vọng:
- Trả về đúng tổng giá trị tồn kho của khách hàng đó

#### 6.4.4. Test [PROCEDURE] `sp_get_expiring_batches`

```sql
SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_expiring_batches(@customer_id, 180);
```

Kỳ vọng:
- Chỉ hiện các batch của đúng khách hàng
- `days_until_expiry` nằm trong khoảng từ `0` đến `180`

#### 6.4.5. Test [PROCEDURE] `sp_get_top_exported_products`

```sql
SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'customer1@gmail.com'
  LIMIT 1
);

CALL sp_get_top_exported_products(@customer_id, 2026, 4, 5);
```

Kỳ vọng:
- Có tối đa `5` dòng
- Sắp xếp giảm dần theo `total_quantity_exported`

#### 6.4.6. Test [PROCEDURE] `sp_complete_inbound_receipt`

```sql
SELECT receipt_id, status
FROM inbound_receipt
WHERE receipt_id = 9802;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9701
  AND batch_no = 'SPK-DRAFT-2026';

CALL sp_complete_inbound_receipt(9802);

SELECT receipt_id, status
FROM inbound_receipt
WHERE receipt_id = 9802;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9701
  AND batch_no = 'SPK-DRAFT-2026';
```

Kỳ vọng:
- Phiếu nhập đổi từ `Draft` sang `Completed`
- Batch `SPK-DRAFT-2026` được cộng vào `inventory`

Sau khi demo:
- nên `ROLLBACK` nếu bạn đang chạy trong transaction
- nếu đã chạy thật ngoài transaction thì reload lại `sample_data.sql`

#### 6.4.7. Test [PROCEDURE] `sp_complete_outbound_issue`

```sql
SELECT issue_id, status
FROM outbound_issue
WHERE issue_id = 9902;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';

CALL sp_complete_outbound_issue(9902);

SELECT issue_id, status
FROM outbound_issue
WHERE issue_id = 9902;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';
```

Kỳ vọng:
- Phiếu xuất đổi từ `Draft` sang `Completed`
- `inventory.quantity` của `BUTTER-APR26` bị trừ đúng số lượng xuất

Sau khi demo:
- nên `ROLLBACK` nếu bạn đang chạy trong transaction
- nếu đã chạy thật ngoài transaction thì reload lại `sample_data.sql`

### 6.5. Test từng trigger

Phần này tập trung test trigger riêng lẻ, không đi qua service Java.

#### 6.5.1. Test [TRIGGER] `trg_warehouse_bi_validate`

```sql
START TRANSACTION;

INSERT INTO warehouse (
  warehouse_id, warehouse_name, address, area, rental_price, status, admin_id
) VALUES (
  99901, '   ', 'Test address', -10, 1000000, 'Active',
  (SELECT admin_id FROM admin ORDER BY admin_id LIMIT 1)
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Warehouse name is required` hoặc `Warehouse area must be greater than zero`

#### 6.5.2. Test [TRIGGER] `trg_warehouse_bu_validate`

```sql
START TRANSACTION;

UPDATE warehouse
SET warehouse_name = '   '
WHERE warehouse_id = 9101;

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Warehouse name is required`

#### 6.5.3. Test [TRIGGER] `trg_lease_contract_bi_validate`

```sql
START TRANSACTION;

INSERT INTO lease_contract (
  contract_id, customer_id, warehouse_id, start_date, end_date,
  rental_price, status, purpose, created_at
) VALUES (
  99901,
  (SELECT customer_id FROM customer ORDER BY customer_id LIMIT 1),
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
- Báo lỗi `Lease contract end date must be on or after start date`

#### 6.5.4. Test [TRIGGER] `trg_lease_contract_bu_validate`

```sql
START TRANSACTION;

UPDATE lease_contract
SET end_date = DATE_SUB(start_date, INTERVAL 1 DAY)
WHERE contract_id = 9201;

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Lease contract end date must be on or after start date`

Test thêm cho nhánh auto-expire:

```sql
START TRANSACTION;

UPDATE lease_contract
SET status = 'Active',
    end_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
WHERE contract_id = 9201;

SELECT contract_id, status, end_date
FROM lease_contract
WHERE contract_id = 9201;

ROLLBACK;
```

Kỳ vọng:
- `status` tự đổi thành `Expired`

#### 6.5.5. Test [TRIGGER] `trg_product_bi_validate`

```sql
START TRANSACTION;

INSERT INTO product (
  product_id, product_name, current_price, unit_of_measure,
  customer_id, category_id, is_deleted
) VALUES (
  99901, '   ', -1, '   ',
  (SELECT customer_id FROM customer WHERE user_name = 'customer1@gmail.com' LIMIT 1),
  9401,
  FALSE
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi do tên rỗng, đơn vị tính rỗng, hoặc giá âm

#### 6.5.6. Test [TRIGGER] `trg_product_bu_validate`

```sql
START TRANSACTION;

UPDATE product
SET current_price = -1
WHERE product_id = 9701;

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Product current price cannot be negative`

#### 6.5.7. Test [TRIGGER] `trg_inbound_detail_bi_validate`

```sql
START TRANSACTION;

INSERT INTO inbound_receipt_detail (
  receipt_id, product_id, batch_no, quantity, import_price, expiry_date
) VALUES (
  9802, 9701, '   ', 0, -1, NULL
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi do `batch_no` rỗng, `quantity <= 0` hoặc `import_price < 0`

#### 6.5.8. Test [TRIGGER] `trg_inbound_detail_bu_validate`

```sql
START TRANSACTION;

UPDATE inbound_receipt_detail
SET quantity = 0
WHERE receipt_id = 9802
  AND product_id = 9701
  AND batch_no = 'SPK-DRAFT-2026';

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Inbound quantity must be greater than zero`

#### 6.5.9. Test [TRIGGER] `trg_inbound_receipt_au_inventory`

```sql
START TRANSACTION;

SELECT receipt_id, status
FROM inbound_receipt
WHERE receipt_id = 9802;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9701
  AND batch_no = 'SPK-DRAFT-2026';

UPDATE inbound_receipt
SET status = 'Completed'
WHERE receipt_id = 9802;

SELECT receipt_id, status
FROM inbound_receipt
WHERE receipt_id = 9802;

SELECT *
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9701
  AND batch_no = 'SPK-DRAFT-2026';

ROLLBACK;
```

Kỳ vọng:
- Sau `UPDATE`, tồn kho tăng lên hoặc xuất hiện mới batch `SPK-DRAFT-2026`

#### 6.5.11. Test [TRIGGER] `trg_outbound_detail_bi_validate`

```sql
START TRANSACTION;

INSERT INTO outbound_issue_detail (
  issue_id, product_id, batch_no, quantity, selling_price
) VALUES (
  9902, 9702, '   ', 0, -1
);

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi do batch rỗng, số lượng không hợp lệ, hoặc giá bán âm

#### 6.5.12. Test [TRIGGER] `trg_outbound_detail_bu_validate`

```sql
START TRANSACTION;

UPDATE outbound_issue_detail
SET selling_price = -1
WHERE issue_id = 9902
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Outbound selling price cannot be negative`

#### 6.5.13. Test [TRIGGER] `trg_outbound_issue_bu_check_inventory`

```sql
START TRANSACTION;

UPDATE outbound_issue_detail
SET quantity = 100000
WHERE issue_id = 9902
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';

UPDATE outbound_issue
SET status = 'Completed'
WHERE issue_id = 9902;

ROLLBACK;
```

Kỳ vọng:
- Báo lỗi `Insufficient inventory to complete outbound issue`

#### 6.5.14. Test [TRIGGER] `trg_outbound_issue_au_inventory`

```sql
START TRANSACTION;

SELECT quantity
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';

UPDATE outbound_issue
SET status = 'Completed'
WHERE issue_id = 9902;

SELECT quantity
FROM inventory
WHERE warehouse_id = 9101
  AND product_id = 9702
  AND batch_no = 'BUTTER-APR26';

ROLLBACK;
```

Kỳ vọng:
- `inventory.quantity` giảm đúng bằng số lượng của detail thuộc `issue_id = 9902`

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
