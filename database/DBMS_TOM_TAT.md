# Tóm tắt CSDL để thuyết trình DBMS
**Đề tài:** Warehouse Rental & Logistics Management System

## 1) Giới thiệu bài toán và mục tiêu hệ thống
Hệ thống giải quyết bài toán quản lý **cho thuê kho + vận hành logistics** trên cùng một nền tảng dữ liệu: quản lý kho, hợp đồng thuê, yêu cầu thuê, nhập kho, xuất kho, tồn kho theo lô, nhà cung cấp, người mua và báo cáo.

- **Đối tượng sử dụng chính:** `Admin` và `Customer` (theo thiết kế tài khoản hiện tại).
- **Vấn đề thực tế:** dữ liệu kho và dữ liệu cho thuê thường rời rạc, dễ trùng lặp, khó truy vết theo lô hàng và hợp đồng.
- **Mục tiêu database:** lưu trữ tập trung, giảm dư thừa dữ liệu, đảm bảo toàn vẹn bằng khóa/ràng buộc/trigger, hỗ trợ truy vấn báo cáo nhanh.

## 2) Phạm vi chức năng của hệ thống
Các module được thiết kế bám theo nghiệp vụ:
- Quản lý tài khoản và xác thực (`Admin`, `Customer`).
- Quản lý kho cho thuê (`Warehouse`, `LeaseContract`, `WarehouseRentalRequest`).
- Quản lý master data hàng hóa (`Category`, `Product`, `Supplier`, `Buyer`).
- Quản lý giao dịch kho (`InboundReceipt`, `OutboundIssue`, `Inventory` theo batch).
- Báo cáo và thống kê tồn kho/xuất hàng/hạn dùng.

**Luồng nghiệp vụ ngắn gọn:**  
Khách hàng gửi yêu cầu thuê kho -> Admin duyệt/từ chối -> tạo hợp đồng -> khách hàng nhập kho/xuất kho -> hệ thống cập nhật tồn kho -> sinh báo cáo.

## 3) Phân tích nghiệp vụ / Use Case
| Actor | Chức năng chính |
|---|---|
| Customer | Đăng ký/đăng nhập, gửi yêu cầu thuê kho, quản lý danh mục/sản phẩm/NCC/người mua, nhập kho/xuất kho, xem tồn kho và báo cáo |
| Admin | Quản lý kho, duyệt yêu cầu thuê, quản lý hợp đồng, quản lý danh sách khách hàng |
| Hệ thống DBMS | Kiểm tra ràng buộc, tự động cập nhật tồn kho qua trigger, tính toán báo cáo qua view/function/procedure |

**Use case trọng tâm để trình bày (3-5 ý):**
1. Duyệt yêu cầu thuê kho và liên kết hợp đồng.
2. Hoàn tất phiếu nhập để tăng tồn kho theo batch.
3. Hoàn tất phiếu xuất để giảm tồn kho, chặn xuất vượt tồn.
4. Theo dõi lô hàng sắp hết hạn.
5. Thống kê top sản phẩm xuất theo tháng.

## 4) Thiết kế CSDL khái niệm (ERD)
**Entity chính (14 bảng):** `Admin`, `Customer`, `Warehouse`, `LeaseContract`, `WarehouseRentalRequest`, `Category`, `Product`, `Supplier`, `Buyer`, `Inventory`, `InboundReceipt`, `InboundReceiptDetail`, `OutboundIssue`, `OutboundIssueDetail`.

**Quan hệ chính:**
- `Admin` 1-n `Warehouse`.
- `Customer` 1-n `LeaseContract`, `WarehouseRentalRequest`, `Category`, `Product`, `Supplier`, `Buyer`.
- `Warehouse` 1-n `InboundReceipt`, `OutboundIssue`, `LeaseContract`.
- `InboundReceipt` 1-n `InboundReceiptDetail`.
- `OutboundIssue` 1-n `OutboundIssueDetail`.

**Quan hệ n-n đã tách bảng trung gian (dạng detail):**
- `InboundReceipt` n-n `Product` qua `InboundReceiptDetail`.
- `OutboundIssue` n-n `Product` qua `OutboundIssueDetail`.

## 5) Thiết kế logic: bảng, PK, FK
| Bảng | Vai trò | Khóa chính | Khóa ngoại quan trọng |
|---|---|---|---|
| `Customer` | Thông tin khách thuê | `CustomerId` | - |
| `Warehouse` | Kho cho thuê | `WarehouseId` | `AdminId -> Admin` |
| `LeaseContract` | Hợp đồng thuê kho | `ContractId` | `CustomerId -> Customer`, `WarehouseId -> Warehouse` |
| `WarehouseRentalRequest` | Yêu cầu thuê kho | `RequestId` | `CustomerId -> Customer`, `WarehouseId -> Warehouse`, `ContractId -> LeaseContract` |
| `Product` | Hàng hóa | `ProductId` | `CustomerId -> Customer`, `CategoryId -> Category` |
| `Inventory` | Tồn kho theo lô | (`WarehouseId`,`ProductId`,`BatchNo`) | `WarehouseId -> Warehouse`, `ProductId -> Product` |
| `InboundReceiptDetail` | Chi tiết nhập kho | (`ReceiptId`,`ProductId`,`BatchNo`) | `ReceiptId -> InboundReceipt`, `ProductId -> Product` |
| `OutboundIssueDetail` | Chi tiết xuất kho | (`IssueId`,`ProductId`,`BatchNo`) | `IssueId -> OutboundIssue`, `ProductId -> Product` |

## 6) Chuẩn hóa dữ liệu
Database được thiết kế đến **3NF**:
- **1NF:** mỗi cột là một giá trị đơn, không có cột danh sách.
- **2NF:** các bảng chi tiết dùng khóa ghép; thuộc tính phụ thuộc đầy đủ vào khóa chính.
- **3NF:** tách riêng thực thể độc lập (khách hàng, kho, sản phẩm, hợp đồng, giao dịch) để tránh phụ thuộc bắc cầu và giảm lặp dữ liệu.

## 7) Ràng buộc toàn vẹn dữ liệu
- **PRIMARY KEY:** tất cả bảng đều có PK, đặc biệt PK ghép ở `Inventory`, `InboundReceiptDetail`, `OutboundIssueDetail`.
- **FOREIGN KEY:** liên kết chặt giữa bảng nghiệp vụ; ví dụ hợp đồng phải tham chiếu khách hàng và kho hợp lệ.
- **UNIQUE:** `Admin.UserName`, `Admin.Email`, `Customer.UserName`, `Customer.Email`; `WarehouseRentalRequest.ContractId` là unique.
- **NOT NULL/DEFAULT/ENUM:** áp dụng cho nhiều cột nghiệp vụ (status, giá, thời gian tạo...).
- **ON DELETE / ON UPDATE:** phần lớn `RESTRICT`, riêng `WarehouseRentalRequest.ContractId` dùng `ON DELETE SET NULL`.
- **Kiểm tra nâng cao bằng trigger:** chặn số lượng âm, giá âm, ngày không hợp lệ, chặn xuất vượt tồn.

## 8) Các truy vấn SQL quan trọng (gợi ý demo)
```sql
-- 1) JOIN: Danh sách yêu cầu thuê đang chờ duyệt
SELECT r.RequestId, c.CustomerName, w.WarehouseName, r.StartDate, r.EndDate, r.Status
FROM WarehouseRentalRequest r
JOIN Customer c ON c.CustomerId = r.CustomerId
JOIN Warehouse w ON w.WarehouseId = r.WarehouseId
WHERE r.Status = 'Pending'
ORDER BY r.CreatedAt DESC;

-- 2) GROUP BY: Tổng giá trị tồn kho theo khách hàng
SELECT p.CustomerId, SUM(i.Quantity * p.CurrentPrice) AS TotalInventoryValue
FROM Inventory i
JOIN Product p ON p.ProductId = i.ProductId
GROUP BY p.CustomerId;

-- 3) Top 5 sản phẩm xuất nhiều nhất theo tháng
SELECT p.ProductId, p.ProductName, SUM(od.Quantity) AS TotalExportQty
FROM OutboundIssueDetail od
JOIN OutboundIssue o ON o.IssueId = od.IssueId
JOIN Product p ON p.ProductId = od.ProductId
WHERE o.Status = 'Completed'
  AND YEAR(o.IssueDate) = 2026
  AND MONTH(o.IssueDate) = 4
GROUP BY p.ProductId, p.ProductName
ORDER BY TotalExportQty DESC
LIMIT 5;
```

## 9) View, Stored Procedure, Trigger
- **Views (4):** `vw_current_tenants`, `vw_inventory_summary`, `vw_expiring_batches`, `vw_monthly_product_exports`.
- **Functions (3):** `fn_inventory_batch_value`, `fn_customer_inventory_value`, `fn_available_inventory`.
- **Stored Procedures (7):** ví dụ `sp_expire_lease_contracts`, `sp_complete_inbound_receipt`, `sp_complete_outbound_issue`, `sp_get_top_exported_products`.
- **Triggers (15):**
  - Validate dữ liệu đầu vào trước insert/update.
  - Tự động cộng/trừ tồn khi phiếu nhập/xuất chuyển `Completed`.
  - Không cho sửa detail của phiếu sau khi đã `Completed`; chỉ cho thao tác ở trạng thái `Draft`.

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
  - **Admin:** quản lý kho, duyệt yêu cầu thuê, quản lý hợp đồng/khách hàng.
  - **Customer:** quản lý dữ liệu hàng hóa, nhập-xuất-tồn và xem báo cáo của mình.

---
## Phụ lục: nội dung thư mục `database`
| File | Vai trò |
|---|---|
| `schema.sql` | Script đầy đủ: tạo bảng + ràng buộc + view + function + procedure + trigger. |
| `dbms_objects.sql` | Script bổ sung DBMS object khi bảng đã có từ Hibernate. |
| `sample_data.sql` | Dữ liệu mẫu demo, idempotent với `ON DUPLICATE KEY UPDATE`. |
