# Giải thích View, Function, Procedure, Trigger

Tài liệu này giải thích các DBMS object trong [dbms_objects.sql](/d:/Working/IdeaProjects/DBMS-warehouse-rental-management-merge-check/database/dbms_objects.sql:1): chúng làm gì, có tác dụng gì, và được tạo ra để phục vụ mục đích nghiệp vụ nào.

Phạm vi:
- `4` view
- `3` function
- `7` stored procedure
- `23` trigger

Lưu ý khi demo:
- Database runtime của project là `warehouse_db`.
- Nếu đã import [sample_data.sql](/d:/Working/IdeaProjects/DBMS-warehouse-rental-management-merge-check/database/sample_data.sql:1), có thể dùng trực tiếp các ID mẫu như `9101`, `9701`, `9702`, `9802`, `9902`.
- Với các procedure hoàn tất phiếu nhập/xuất, demo sẽ làm thay đổi dữ liệu thật trong DB demo.

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
| `vw_current_tenants` | Join `lease_contract`, `customer`, `warehouse`, `admin`; chỉ lấy hợp đồng `Active` và còn hiệu lực theo ngày hiện tại | Cho ra danh sách khách thuê đang sử dụng kho | Hỗ trợ admin xem khách thuê hiện tại theo kho mình quản lý |
| `vw_inventory_summary` | Tổng hợp tồn kho theo khách hàng, kho, sản phẩm, category; tính `total_quantity`, `total_inventory_value`, `batch_count` | Biến dữ liệu tồn kho chi tiết theo batch thành báo cáo tổng hợp dễ đọc | Hỗ trợ dashboard tồn kho và báo cáo giá trị hàng hóa |
| `vw_expiring_batches` | Lấy các lô nhập đã hoàn tất, nối với `inventory` để biết số lượng hiện còn, hạn dùng và số ngày còn lại | Theo dõi lô sắp hết hạn nhưng chỉ tính phần còn tồn thật | Hỗ trợ cảnh báo hàng sắp hết hạn và xử lý hàng tồn |
| `vw_monthly_product_exports` | Tổng hợp lượng xuất và doanh thu theo tháng từ `outbound_issue` và `outbound_issue_detail` | Cho ra dữ liệu nền để lọc top sản phẩm xuất nhiều | Hỗ trợ báo cáo bán hàng/xuất kho theo tháng |

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
| `fn_inventory_batch_value` | `warehouse_id`, `product_id`, `batch_no` | `DECIMAL(18,2)` | Tính giá trị tồn kho của đúng một lô hàng trong một kho | Dùng khi cần biết giá trị tiền của từng batch |
| `fn_customer_inventory_value` | `customer_id` | `DECIMAL(18,2)` | Tính tổng giá trị tồn kho của toàn bộ sản phẩm thuộc một khách hàng | Dùng cho báo cáo tổng tài sản lưu kho của khách |
| `fn_available_inventory` | `warehouse_id`, `product_id`, `batch_no` | `INT` | Trả về số lượng tồn khả dụng hiện tại của một batch | Dùng trong trigger/procedure để chặn xuất vượt tồn hoặc rollback sai |

### Query nhanh để demo function

```sql
USE warehouse_db;

SET @customer_id = (
  SELECT customer_id
  FROM customer
  WHERE user_name = 'hung'
  LIMIT 1
);

SELECT fn_inventory_batch_value(9101, 9701, 'SPK-A-2026') AS batch_value;

SELECT fn_customer_inventory_value(@customer_id) AS customer_inventory_value;

SELECT fn_available_inventory(9101, 9702, 'BUTTER-APR26') AS available_qty;
```

## 4. Stored Procedures

Phần này là quan trọng nhất khi demo vì giảng viên sẽ nhìn thấy rõ DB xử lý nghiệp vụ bằng `CALL`.

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

### 4.1. `sp_expire_lease_contracts()`

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

Query demo:

```sql
USE warehouse_db;

SELECT contract_id, customer_id, warehouse_id, status, start_date, end_date
FROM lease_contract
WHERE end_date < CURDATE()
  AND status IN ('Pending', 'Active');

CALL sp_expire_lease_contracts();
```

Kỳ vọng:
- Nếu có hợp đồng cũ chưa đồng bộ trạng thái thì procedure sẽ chuyển sang `Expired`.
- Nếu không có, kết quả thường là `expired_contracts = 0`.

### 4.2. `sp_get_current_tenants_by_admin(IN p_admin_id INT)`

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
  WHERE user_name = 'layout_admin_0427030337'
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

### 4.3. `sp_get_customer_inventory_value(IN p_customer_id INT)`

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
  WHERE user_name = 'hung'
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

### 4.4. `sp_get_expiring_batches(IN p_customer_id INT, IN p_days_ahead INT)`

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
  WHERE user_name = 'hung'
  LIMIT 1
);

CALL sp_get_expiring_batches(@customer_id, 180);
```

Gợi ý:
- Dùng `180` ngày để dễ thấy dữ liệu mẫu hơn.
- Nếu muốn đúng ý nghĩa "sắp hết hạn", dùng `30`.

### 4.5. `sp_get_top_exported_products(IN p_customer_id INT, IN p_year INT, IN p_month INT, IN p_limit INT)`

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
  WHERE user_name = 'hung'
  LIMIT 1
);

CALL sp_get_top_exported_products(@customer_id, 2026, 4, 5);
```

### 4.6. `sp_complete_inbound_receipt(IN p_receipt_id INT)`

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

Reset để demo lại:

```sql
UPDATE inbound_receipt
SET status = 'Draft'
WHERE receipt_id = 9802;
```

Khi reset:
- Trigger sẽ tự trừ lại phần tồn đã cộng lúc hoàn tất

### 4.7. `sp_complete_outbound_issue(IN p_issue_id INT)`

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
- Đóng gói nghiệp vụ xuất kho thành một lệnh có đủ kiểm tra và cập nhật

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

Reset để demo lại:

```sql
UPDATE outbound_issue
SET status = 'Draft'
WHERE issue_id = 9902;
```

Khi reset:
- Trigger sẽ tự cộng lại số lượng đã trừ

## 5. Triggers

Các trigger trong project chia thành 5 nhóm: validate dữ liệu master, validate chi tiết nhập, đồng bộ tồn khi nhập, validate chi tiết xuất, và đồng bộ tồn khi xuất.

### 5.1. Nhóm trigger validate dữ liệu master

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| `trg_warehouse_bi_validate` | `BEFORE INSERT` | `warehouse` | Trim tên kho, chặn tên rỗng, chặn `area <= 0` | Bảo đảm dữ liệu kho hợp lệ ngay từ lúc thêm mới |
| `trg_warehouse_bu_validate` | `BEFORE UPDATE` | `warehouse` | Trim tên kho, chặn tên rỗng, chặn `area <= 0` | Không cho cập nhật kho thành dữ liệu vô nghĩa |
| `trg_lease_contract_bi_validate` | `BEFORE INSERT` | `lease_contract` | Chặn `end_date < start_date`; nếu quá hạn thì tự đổi status sang `Expired` | Bảo đảm logic ngày tháng hợp đồng |
| `trg_lease_contract_bu_validate` | `BEFORE UPDATE` | `lease_contract` | Kiểm tra ngày hợp đồng; tự đổi `Pending/Active` quá hạn sang `Expired` | Giữ trạng thái hợp đồng luôn nhất quán |
| `trg_product_bi_validate` | `BEFORE INSERT` | `product` | Trim tên hàng và đơn vị tính; chặn rỗng; chặn giá âm | Bảo vệ dữ liệu hàng hóa |
| `trg_product_bu_validate` | `BEFORE UPDATE` | `product` | Giống trigger insert nhưng áp dụng cho cập nhật | Không cho dữ liệu sản phẩm bị sai sau này |
| `trg_inventory_bi_validate` | `BEFORE INSERT` | `inventory` | Trim `batch_no`; chặn batch rỗng; chặn tồn âm | Bảo đảm bản ghi tồn kho tối thiểu hợp lệ |
| `trg_inventory_bu_validate` | `BEFORE UPDATE` | `inventory` | Trim `batch_no`; chặn batch rỗng; chặn tồn âm | Ngăn mọi thay đổi làm tồn kho thành âm |

### 5.2. Nhóm trigger validate phiếu nhập

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| `trg_inbound_detail_bi_validate` | `BEFORE INSERT` | `inbound_receipt_detail` | Trim `batch_no`; chặn batch rỗng; chặn `quantity <= 0`; chặn `import_price < 0` | Bảo đảm dòng nhập kho hợp lệ |
| `trg_inbound_detail_bu_validate` | `BEFORE UPDATE` | `inbound_receipt_detail` | Kiểm tra lại toàn bộ dữ liệu của dòng detail khi cập nhật | Không cho sửa chi tiết nhập thành dữ liệu sai |

### 5.3. Nhóm trigger đồng bộ tồn kho khi nhập

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| `trg_inbound_receipt_au_inventory` | `AFTER UPDATE` | `inbound_receipt` | Khi phiếu đổi sang `Completed` thì cộng tồn theo detail; khi rời trạng thái `Completed` thì trừ ngược lại; chặn rollback nếu làm tồn âm | Đồng bộ tồn kho theo trạng thái phiếu nhập |
| `trg_inbound_detail_ai_inventory` | `AFTER INSERT` | `inbound_receipt_detail` | Nếu phiếu cha đã `Completed` thì detail mới thêm vào sẽ cộng luôn vào tồn kho | Giữ tồn kho đúng cả khi thêm detail sau khi phiếu đã hoàn tất |
| `trg_inbound_detail_au_inventory` | `AFTER UPDATE` | `inbound_receipt_detail` | Nếu detail cũ thuộc phiếu `Completed` thì trừ phần cũ; nếu detail mới thuộc phiếu `Completed` thì cộng phần mới; chặn âm kho | Tồn kho luôn khớp với detail hiện tại |
| `trg_inbound_detail_ad_inventory` | `AFTER DELETE` | `inbound_receipt_detail` | Nếu xóa detail của phiếu đã `Completed` thì trừ lại tồn; chặn thao tác nếu sẽ làm tồn âm | Cho phép sửa chứng từ nhập nhưng vẫn bảo vệ toàn vẹn tồn kho |

Ý nghĩa trình bày:
- Nhóm này cho thấy nhập kho không phải chỉ là thêm dòng vào detail.
- Chỉ khi chứng từ hoàn tất hoặc detail của chứng từ hoàn tất thay đổi thì tồn kho mới được đồng bộ.

### 5.4. Nhóm trigger validate phiếu xuất

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| `trg_outbound_detail_bi_validate` | `BEFORE INSERT` | `outbound_issue_detail` | Trim `batch_no`; chặn batch rỗng; chặn `quantity <= 0`; chặn `selling_price < 0` | Bảo đảm dữ liệu dòng xuất kho hợp lệ |
| `trg_outbound_detail_bu_validate` | `BEFORE UPDATE` | `outbound_issue_detail` | Kiểm tra lại detail khi sửa | Không cho dòng xuất thành dữ liệu sai |
| `trg_outbound_issue_bu_check_inventory` | `BEFORE UPDATE` | `outbound_issue` | Trước khi hoàn tất phiếu xuất, gom tổng số lượng cần xuất theo batch và kiểm tra tồn kho có đủ hay không | Chặn hoàn tất phiếu nếu kho không đủ hàng |
| `trg_outbound_detail_bi_check_inventory` | `BEFORE INSERT` | `outbound_issue_detail` | Nếu phiếu cha đã `Completed`, detail mới thêm phải kiểm tra tồn kho ngay | Không cho thêm dòng xuất vượt tồn sau khi phiếu đã hoàn tất |
| `trg_outbound_detail_bu_check_inventory` | `BEFORE UPDATE` | `outbound_issue_detail` | Khi sửa detail của phiếu đã `Completed`, tính lại lượng khả dụng sau khi hoàn trả phần cũ rồi mới cho sửa | Bảo vệ các thao tác sửa detail xuất đã hoàn tất |

### 5.5. Nhóm trigger đồng bộ tồn kho khi xuất

| Trigger | Thời điểm | Bảng | Nó làm gì | Mục đích |
|---|---|---|---|---|
| `trg_outbound_issue_au_inventory` | `AFTER UPDATE` | `outbound_issue` | Khi phiếu đổi sang `Completed` thì trừ kho; khi rời trạng thái `Completed` thì cộng trả lại kho | Đồng bộ tồn kho theo trạng thái phiếu xuất |
| `trg_outbound_detail_ai_inventory` | `AFTER INSERT` | `outbound_issue_detail` | Nếu phiếu cha đã `Completed` thì thêm detail mới sẽ trừ kho ngay | Tồn kho luôn bám sát detail mới phát sinh |
| `trg_outbound_detail_au_inventory` | `AFTER UPDATE` | `outbound_issue_detail` | Cộng trả phần cũ rồi trừ phần mới nếu liên quan phiếu đã `Completed` | Cho phép sửa detail mà tồn kho vẫn đúng |
| `trg_outbound_detail_ad_inventory` | `AFTER DELETE` | `outbound_issue_detail` | Nếu xóa detail của phiếu đã `Completed` thì cộng trả kho | Đảm bảo xóa dòng xuất cũng rollback đúng lượng hàng |

Ý nghĩa trình bày:
- Đây là phần thể hiện rõ nhất "DB tự xử lý nghiệp vụ".
- Java chỉ cần đổi status phiếu hoặc chỉnh detail.
- Trigger chịu trách nhiệm đồng bộ số lượng tồn thật trong `inventory`.

## 6. Cách kể chuyện khi thuyết trình

Có thể trình bày theo logic sau:

1. `View` và `function` là phần đọc dữ liệu, tính toán và báo cáo.
2. `Procedure` là phần đóng gói nghiệp vụ thành các lệnh `CALL`.
3. `Trigger` là lớp tự vệ của database:
   - chặn dữ liệu sai
   - chặn xuất vượt tồn
   - tự cộng/trừ kho khi chứng từ hoàn tất

Một câu kết ngắn gọn để nói với giảng viên:
- "Mục tiêu của nhóm em là để MySQL không chỉ lưu dữ liệu mà còn thực thi một phần business rule cốt lõi, đặc biệt là quản lý tồn kho và bảo vệ toàn vẹn nghiệp vụ."
