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

SET @sample_password = '$2a$10$lg7jM95UjJcON5ZzNfgmRuDB444DTSrXtfJ50J9iz7zRIchs2Ied2';

INSERT INTO `admin` (`admin_name`, `user_name`, `email`, `password`, `created_at`)
VALUES
  ('Admin 1', 'admin1@gmail.com', 'admin1@gmail.com', @sample_password, NOW())
ON DUPLICATE KEY UPDATE
  `admin_name` = VALUES(`admin_name`),
  `password` = VALUES(`password`);

INSERT INTO `customer` (`customer_name`, `user_name`, `email`, `password`, `phone_number`, `address`, `created_at`)
VALUES
  ('Customer 1', 'customer1@gmail.com', 'customer1@gmail.com', @sample_password, '0900000001', 'Ho Chi Minh City', NOW()),
  ('Customer 2', 'customer2@gmail.com', 'customer2@gmail.com', @sample_password, '0900000002', 'Ha Noi', NOW()),
  ('Customer 3', 'customer3@gmail.com', 'customer3@gmail.com', @sample_password, '0900000003', 'Da Nang', NOW()),
  ('Customer 4', 'customer4@gmail.com', 'customer4@gmail.com', @sample_password, '0900000004', 'Can Tho', NOW()),
  ('Customer 5', 'customer5@gmail.com', 'customer5@gmail.com', @sample_password, '0900000005', 'Hai Phong', NOW())
ON DUPLICATE KEY UPDATE
  `customer_name` = VALUES(`customer_name`),
  `password` = VALUES(`password`),
  `phone_number` = VALUES(`phone_number`),
  `address` = VALUES(`address`);

SET @admin1_id = (SELECT `admin_id` FROM `admin` WHERE `user_name` = 'admin1@gmail.com' LIMIT 1);
SET @customer1_id = (SELECT `customer_id` FROM `customer` WHERE `user_name` = 'customer1@gmail.com' LIMIT 1);

INSERT INTO `warehouse` (`warehouse_id`, `warehouse_name`, `address`, `area`, `rental_price`, `status`, `admin_id`) VALUES
  (9101, 'Sample Cold Storage A', 'District 7, Ho Chi Minh City', 1200, 12000000.00, 'Active', @admin1_id),
  (9102, 'Sample Dry Warehouse B', 'Thu Duc, Ho Chi Minh City', 1800, 15000000.00, 'Active', @admin1_id),
  (9103, 'Sample Maintenance Warehouse', 'Binh Thanh, Ho Chi Minh City', 900, 9000000.00, 'Maintenance', @admin1_id),
  (9104, 'Sample Inactive Warehouse', 'Tan Binh, Ho Chi Minh City', 750, 7000000.00, 'Inactive', @admin1_id)
ON DUPLICATE KEY UPDATE
  `warehouse_name` = VALUES(`warehouse_name`),
  `address` = VALUES(`address`),
  `area` = VALUES(`area`),
  `rental_price` = VALUES(`rental_price`),
  `status` = VALUES(`status`),
  `admin_id` = VALUES(`admin_id`);

INSERT INTO `lease_contract` (`contract_id`, `customer_id`, `warehouse_id`, `start_date`, `end_date`, `rental_price`, `status`, `purpose`, `created_at`) VALUES
  (9201, @customer1_id, 9101, '2026-04-01', '2026-12-31', 12000000.00, 'Active', 'Sample active rental contract', NOW()),
  (9202, @customer1_id, 9103, '2026-01-01', '2026-03-31', 9000000.00, 'Expired', 'Expired sample contract', NOW())
ON DUPLICATE KEY UPDATE
  `customer_id` = VALUES(`customer_id`),
  `warehouse_id` = VALUES(`warehouse_id`),
  `start_date` = VALUES(`start_date`),
  `end_date` = VALUES(`end_date`),
  `rental_price` = VALUES(`rental_price`),
  `status` = VALUES(`status`),
  `purpose` = VALUES(`purpose`);

INSERT INTO `warehouse_rental_request` (`request_id`, `customer_id`, `warehouse_id`, `start_date`, `end_date`, `rental_price`, `purpose`, `status`, `review_note`, `contract_id`, `created_at`, `reviewed_at`) VALUES
  (9301, @customer1_id, 9101, '2026-04-01', '2026-12-31', 12000000.00, 'Sample approved request', 'Approved', 'Approved sample request', 9201, NOW(), NOW()),
  (9302, @customer1_id, 9102, '2026-05-01', '2026-08-31', 15000000.00, 'Need extra dry storage', 'Pending', NULL, NULL, NOW(), NULL),
  (9303, @customer1_id, 9102, '2026-09-01', '2026-10-31', 15000000.00, 'Short-term overflow storage', 'Rejected', 'Warehouse reserved for internal maintenance window', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `customer_id` = VALUES(`customer_id`),
  `warehouse_id` = VALUES(`warehouse_id`),
  `start_date` = VALUES(`start_date`),
  `end_date` = VALUES(`end_date`),
  `rental_price` = VALUES(`rental_price`),
  `purpose` = VALUES(`purpose`),
  `status` = VALUES(`status`),
  `review_note` = VALUES(`review_note`),
  `contract_id` = VALUES(`contract_id`),
  `reviewed_at` = VALUES(`reviewed_at`);

INSERT INTO `category` (`category_id`, `category_name`, `customer_id`, `is_deleted`) VALUES
  (9401, 'Electronics', @customer1_id, FALSE),
  (9402, 'Food Ingredients', @customer1_id, FALSE)
ON DUPLICATE KEY UPDATE
  `category_name` = VALUES(`category_name`),
  `customer_id` = VALUES(`customer_id`),
  `is_deleted` = VALUES(`is_deleted`);

INSERT INTO `supplier` (`supplier_id`, `supplier_name`, `phone_number`, `address`, `customer_id`, `is_deleted`) VALUES
  (9501, 'Saigon Supply Co.', '0901000001', 'District 1, Ho Chi Minh City', @customer1_id, FALSE),
  (9502, 'Mekong Fresh Logistics', '0901000002', 'Can Tho', @customer1_id, FALSE)
ON DUPLICATE KEY UPDATE
  `supplier_name` = VALUES(`supplier_name`),
  `phone_number` = VALUES(`phone_number`),
  `address` = VALUES(`address`),
  `customer_id` = VALUES(`customer_id`),
  `is_deleted` = VALUES(`is_deleted`);

INSERT INTO `buyer` (`buyer_id`, `buyer_name`, `email`, `phone_number`, `address`, `customer_id`, `is_deleted`) VALUES
  (9601, 'Sample Retail Buyer', 'buyer@example.com', '0902000001', 'District 3, Ho Chi Minh City', @customer1_id, FALSE),
  (9602, 'Sample Wholesale Buyer', 'wholesale@example.com', '0902000002', 'Da Nang', @customer1_id, FALSE)
ON DUPLICATE KEY UPDATE
  `buyer_name` = VALUES(`buyer_name`),
  `email` = VALUES(`email`),
  `phone_number` = VALUES(`phone_number`),
  `address` = VALUES(`address`),
  `customer_id` = VALUES(`customer_id`),
  `is_deleted` = VALUES(`is_deleted`);

INSERT INTO `product` (`product_id`, `product_name`, `current_price`, `unit_of_measure`, `customer_id`, `category_id`, `is_deleted`) VALUES
  (9701, 'Bluetooth Speaker', 450000.00, 'pcs', @customer1_id, 9401, FALSE),
  (9702, 'Imported Butter', 120000.00, 'box', @customer1_id, 9402, FALSE)
ON DUPLICATE KEY UPDATE
  `product_name` = VALUES(`product_name`),
  `current_price` = VALUES(`current_price`),
  `unit_of_measure` = VALUES(`unit_of_measure`),
  `customer_id` = VALUES(`customer_id`),
  `category_id` = VALUES(`category_id`),
  `is_deleted` = VALUES(`is_deleted`);

INSERT INTO `inbound_receipt` (`receipt_id`, `warehouse_id`, `supplier_id`, `receipt_date`, `status`, `created_at`) VALUES
  (9801, 9101, 9501, '2026-04-05 09:00:00', 'Completed', NOW()),
  (9802, 9101, 9502, '2026-04-20 10:30:00', 'Draft', NOW())
ON DUPLICATE KEY UPDATE
  `warehouse_id` = VALUES(`warehouse_id`),
  `supplier_id` = VALUES(`supplier_id`),
  `receipt_date` = VALUES(`receipt_date`),
  `status` = VALUES(`status`);

INSERT INTO `inbound_receipt_detail` (`receipt_id`, `product_id`, `batch_no`, `quantity`, `import_price`, `expiry_date`) VALUES
  (9801, 9701, 'SPK-A-2026', 150, 320000.00, NULL),
  (9801, 9702, 'BUTTER-APR26', 75, 85000.00, '2026-09-30'),
  (9802, 9701, 'SPK-DRAFT-2026', 20, 315000.00, NULL)
ON DUPLICATE KEY UPDATE
  `quantity` = VALUES(`quantity`),
  `import_price` = VALUES(`import_price`),
  `expiry_date` = VALUES(`expiry_date`);

INSERT INTO `outbound_issue` (`issue_id`, `warehouse_id`, `buyer_id`, `issue_date`, `status`, `created_at`) VALUES
  (9901, 9101, 9601, '2026-04-12 14:00:00', 'Completed', NOW()),
  (9902, 9101, 9602, '2026-04-25 15:00:00', 'Draft', NOW())
ON DUPLICATE KEY UPDATE
  `warehouse_id` = VALUES(`warehouse_id`),
  `buyer_id` = VALUES(`buyer_id`),
  `issue_date` = VALUES(`issue_date`),
  `status` = VALUES(`status`);

INSERT INTO `outbound_issue_detail` (`issue_id`, `product_id`, `batch_no`, `quantity`, `selling_price`) VALUES
  (9901, 9701, 'SPK-A-2026', 30, 520000.00),
  (9902, 9702, 'BUTTER-APR26', 10, 150000.00)
ON DUPLICATE KEY UPDATE
  `quantity` = VALUES(`quantity`),
  `selling_price` = VALUES(`selling_price`);

INSERT INTO `inventory` (`warehouse_id`, `product_id`, `batch_no`, `quantity`, `last_updated`) VALUES
  (9101, 9701, 'SPK-A-2026', 120, NOW()),
  (9101, 9702, 'BUTTER-APR26', 75, NOW())
ON DUPLICATE KEY UPDATE
  `quantity` = VALUES(`quantity`),
  `last_updated` = VALUES(`last_updated`);

SET FOREIGN_KEY_CHECKS = 1;
