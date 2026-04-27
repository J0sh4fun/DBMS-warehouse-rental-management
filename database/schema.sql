-- Warehouse Rental & Logistics Management System
-- MySQL 8+ schema generated from DBML with architectural constraints.
-- Full DBMS demo schema: includes automatic inventory triggers.
-- Do not use these inventory triggers together with Java service inventory
-- updates on the same runtime database, otherwise stock can be updated twice.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TRIGGER IF EXISTS `trg_warehouse_bi_validate`;
DROP TRIGGER IF EXISTS `trg_warehouse_bu_validate`;
DROP TRIGGER IF EXISTS `trg_lease_contract_bi_validate`;
DROP TRIGGER IF EXISTS `trg_lease_contract_bu_validate`;
DROP TRIGGER IF EXISTS `trg_product_bi_validate`;
DROP TRIGGER IF EXISTS `trg_product_bu_validate`;
DROP TRIGGER IF EXISTS `trg_inbound_detail_bi_validate`;
DROP TRIGGER IF EXISTS `trg_inbound_detail_bu_validate`;
DROP TRIGGER IF EXISTS `trg_inbound_receipt_au_inventory`;
DROP TRIGGER IF EXISTS `trg_inbound_detail_ai_inventory`;
DROP TRIGGER IF EXISTS `trg_inbound_detail_au_inventory`;
DROP TRIGGER IF EXISTS `trg_inbound_detail_ad_inventory`;
DROP TRIGGER IF EXISTS `trg_outbound_detail_bi_validate`;
DROP TRIGGER IF EXISTS `trg_outbound_detail_bu_validate`;
DROP TRIGGER IF EXISTS `trg_outbound_issue_bu_check_inventory`;
DROP TRIGGER IF EXISTS `trg_outbound_issue_au_inventory`;
DROP TRIGGER IF EXISTS `trg_outbound_detail_bi_check_inventory`;
DROP TRIGGER IF EXISTS `trg_outbound_detail_bu_check_inventory`;
DROP TRIGGER IF EXISTS `trg_outbound_detail_ai_inventory`;
DROP TRIGGER IF EXISTS `trg_outbound_detail_au_inventory`;
DROP TRIGGER IF EXISTS `trg_outbound_detail_ad_inventory`;
DROP TRIGGER IF EXISTS `trg_inventory_bi_validate`;
DROP TRIGGER IF EXISTS `trg_inventory_bu_validate`;

DROP VIEW IF EXISTS `vw_current_tenants`;
DROP VIEW IF EXISTS `vw_inventory_summary`;
DROP VIEW IF EXISTS `vw_expiring_batches`;
DROP VIEW IF EXISTS `vw_monthly_product_exports`;

DROP PROCEDURE IF EXISTS `sp_expire_lease_contracts`;
DROP PROCEDURE IF EXISTS `sp_get_current_tenants_by_admin`;
DROP PROCEDURE IF EXISTS `sp_get_customer_inventory_value`;
DROP PROCEDURE IF EXISTS `sp_get_expiring_batches`;
DROP PROCEDURE IF EXISTS `sp_get_top_exported_products`;
DROP PROCEDURE IF EXISTS `sp_complete_inbound_receipt`;
DROP PROCEDURE IF EXISTS `sp_complete_outbound_issue`;

DROP FUNCTION IF EXISTS `fn_inventory_batch_value`;
DROP FUNCTION IF EXISTS `fn_customer_inventory_value`;
DROP FUNCTION IF EXISTS `fn_available_inventory`;

DROP TABLE IF EXISTS `OutboundIssueDetail`;
DROP TABLE IF EXISTS `OutboundIssue`;
DROP TABLE IF EXISTS `InboundReceiptDetail`;
DROP TABLE IF EXISTS `InboundReceipt`;
DROP TABLE IF EXISTS `Inventory`;
DROP TABLE IF EXISTS `Product`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `Supplier`;
DROP TABLE IF EXISTS `Buyer`;
DROP TABLE IF EXISTS `WarehouseRentalRequest`;
DROP TABLE IF EXISTS `LeaseContract`;
DROP TABLE IF EXISTS `Warehouse`;
DROP TABLE IF EXISTS `Customer`;
DROP TABLE IF EXISTS `Admin`;

CREATE TABLE `Admin` (
  `AdminId` INT NOT NULL AUTO_INCREMENT,
  `AdminName` VARCHAR(255) NOT NULL,
  `UserName` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AdminId`),
  UNIQUE KEY `uk_admin_username` (`UserName`),
  UNIQUE KEY `uk_admin_email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Customer` (
  `CustomerId` INT NOT NULL AUTO_INCREMENT,
  `CustomerName` VARCHAR(255) NOT NULL,
  `UserName` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `PhoneNumber` VARCHAR(30),
  `Address` VARCHAR(255),
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CustomerId`),
  UNIQUE KEY `uk_customer_username` (`UserName`),
  UNIQUE KEY `uk_customer_email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Warehouse` (
  `WarehouseId` INT NOT NULL AUTO_INCREMENT,
  `WarehouseName` VARCHAR(255) NOT NULL,
  `Address` VARCHAR(255),
  `Area` FLOAT,
  `RentalPrice` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `Status` ENUM('Active', 'Maintenance', 'Inactive') NOT NULL,
  `AdminId` INT NOT NULL,
  PRIMARY KEY (`WarehouseId`),
  KEY `idx_warehouse_admin_id` (`AdminId`),
  CONSTRAINT `fk_warehouse_admin`
    FOREIGN KEY (`AdminId`) REFERENCES `Admin` (`AdminId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `LeaseContract` (
  `ContractId` INT NOT NULL AUTO_INCREMENT,
  `CustomerId` INT NOT NULL,
  `WarehouseId` INT NOT NULL,
  `StartDate` DATE NOT NULL,
  `EndDate` DATE NOT NULL,
  `RentalPrice` DECIMAL(18,2) NOT NULL,
  `Status` ENUM('Pending', 'Active', 'Expired', 'Cancelled') NOT NULL,
  `Purpose` VARCHAR(255),
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ContractId`),
  KEY `idx_lease_customer_id` (`CustomerId`),
  KEY `idx_lease_warehouse_id` (`WarehouseId`),
  CONSTRAINT `fk_lease_customer`
    FOREIGN KEY (`CustomerId`) REFERENCES `Customer` (`CustomerId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_lease_warehouse`
    FOREIGN KEY (`WarehouseId`) REFERENCES `Warehouse` (`WarehouseId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `WarehouseRentalRequest` (
  `RequestId` INT NOT NULL AUTO_INCREMENT,
  `CustomerId` INT NOT NULL,
  `WarehouseId` INT NOT NULL,
  `StartDate` DATE NOT NULL,
  `EndDate` DATE NOT NULL,
  `RentalPrice` DECIMAL(18,2) NOT NULL,
  `Purpose` VARCHAR(255),
  `Status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL,
  `ReviewNote` VARCHAR(255),
  `ContractId` INT,
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ReviewedAt` DATETIME,
  PRIMARY KEY (`RequestId`),
  KEY `idx_rental_request_customer_id` (`CustomerId`),
  KEY `idx_rental_request_warehouse_id` (`WarehouseId`),
  UNIQUE KEY `uk_rental_request_contract_id` (`ContractId`),
  CONSTRAINT `fk_rental_request_customer`
    FOREIGN KEY (`CustomerId`) REFERENCES `Customer` (`CustomerId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_request_warehouse`
    FOREIGN KEY (`WarehouseId`) REFERENCES `Warehouse` (`WarehouseId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_request_contract`
    FOREIGN KEY (`ContractId`) REFERENCES `LeaseContract` (`ContractId`)
    ON UPDATE RESTRICT ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Buyer` (
  `BuyerId` INT NOT NULL AUTO_INCREMENT,
  `BuyerName` VARCHAR(255) NOT NULL,
  `Email` VARCHAR(255),
  `PhoneNumber` VARCHAR(30),
  `Address` VARCHAR(255),
  `CustomerId` INT NOT NULL,
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`BuyerId`),
  KEY `idx_buyer_customer_id` (`CustomerId`),
  CONSTRAINT `fk_buyer_customer`
    FOREIGN KEY (`CustomerId`) REFERENCES `Customer` (`CustomerId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Category` (
  `CategoryId` INT NOT NULL AUTO_INCREMENT,
  `CategoryName` VARCHAR(255) NOT NULL,
  `CustomerId` INT NOT NULL,
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`CategoryId`),
  KEY `idx_category_customer_id` (`CustomerId`),
  CONSTRAINT `fk_category_customer`
    FOREIGN KEY (`CustomerId`) REFERENCES `Customer` (`CustomerId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Supplier` (
  `SupplierId` INT NOT NULL AUTO_INCREMENT,
  `SupplierName` VARCHAR(255) NOT NULL,
  `PhoneNumber` VARCHAR(30),
  `Address` VARCHAR(255),
  `CustomerId` INT NOT NULL,
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`SupplierId`),
  KEY `idx_supplier_customer_id` (`CustomerId`),
  CONSTRAINT `fk_supplier_customer`
    FOREIGN KEY (`CustomerId`) REFERENCES `Customer` (`CustomerId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Product` (
  `ProductId` INT NOT NULL AUTO_INCREMENT,
  `ProductName` VARCHAR(255) NOT NULL,
  `CurrentPrice` DECIMAL(18,2) NOT NULL,
  `UnitOfMeasure` VARCHAR(100) NOT NULL,
  `CustomerId` INT NOT NULL,
  `CategoryId` INT NOT NULL,
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`ProductId`),
  KEY `idx_product_customer_id` (`CustomerId`),
  KEY `idx_product_category_id` (`CategoryId`),
  CONSTRAINT `fk_product_customer`
    FOREIGN KEY (`CustomerId`) REFERENCES `Customer` (`CustomerId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_product_category`
    FOREIGN KEY (`CategoryId`) REFERENCES `Category` (`CategoryId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Inventory` (
  `WarehouseId` INT NOT NULL,
  `ProductId` INT NOT NULL,
  `BatchNo` VARCHAR(100) NOT NULL,
  `Quantity` INT NOT NULL,
  `LastUpdated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`WarehouseId`, `ProductId`, `BatchNo`),
  KEY `idx_inventory_product_id` (`ProductId`),
  CONSTRAINT `fk_inventory_warehouse`
    FOREIGN KEY (`WarehouseId`) REFERENCES `Warehouse` (`WarehouseId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_inventory_product`
    FOREIGN KEY (`ProductId`) REFERENCES `Product` (`ProductId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `InboundReceipt` (
  `ReceiptId` INT NOT NULL AUTO_INCREMENT,
  `WarehouseId` INT NOT NULL,
  `SupplierId` INT NOT NULL,
  `ReceiptDate` DATETIME NOT NULL,
  `Status` ENUM('Draft', 'Completed', 'Cancelled') NOT NULL,
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReceiptId`),
  KEY `idx_inbound_warehouse_id` (`WarehouseId`),
  KEY `idx_inbound_supplier_id` (`SupplierId`),
  CONSTRAINT `fk_inbound_warehouse`
    FOREIGN KEY (`WarehouseId`) REFERENCES `Warehouse` (`WarehouseId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_inbound_supplier`
    FOREIGN KEY (`SupplierId`) REFERENCES `Supplier` (`SupplierId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `InboundReceiptDetail` (
  `ReceiptId` INT NOT NULL,
  `ProductId` INT NOT NULL,
  `BatchNo` VARCHAR(100) NOT NULL,
  `Quantity` INT NOT NULL,
  `ImportPrice` DECIMAL(18,2) NOT NULL,
  `ExpiryDate` DATE,
  PRIMARY KEY (`ReceiptId`, `ProductId`, `BatchNo`),
  KEY `idx_inbound_detail_product_id` (`ProductId`),
  CONSTRAINT `fk_inbound_detail_receipt`
    FOREIGN KEY (`ReceiptId`) REFERENCES `InboundReceipt` (`ReceiptId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_inbound_detail_product`
    FOREIGN KEY (`ProductId`) REFERENCES `Product` (`ProductId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `OutboundIssue` (
  `IssueId` INT NOT NULL AUTO_INCREMENT,
  `WarehouseId` INT NOT NULL,
  `BuyerId` INT NOT NULL,
  `IssueDate` DATETIME NOT NULL,
  `Status` ENUM('Draft', 'Completed', 'Cancelled') NOT NULL,
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IssueId`),
  KEY `idx_outbound_warehouse_id` (`WarehouseId`),
  KEY `idx_outbound_buyer_id` (`BuyerId`),
  CONSTRAINT `fk_outbound_warehouse`
    FOREIGN KEY (`WarehouseId`) REFERENCES `Warehouse` (`WarehouseId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_outbound_buyer`
    FOREIGN KEY (`BuyerId`) REFERENCES `Buyer` (`BuyerId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `OutboundIssueDetail` (
  `IssueId` INT NOT NULL,
  `ProductId` INT NOT NULL,
  `BatchNo` VARCHAR(100) NOT NULL,
  `Quantity` INT NOT NULL,
  `SellingPrice` DECIMAL(18,2) NOT NULL,
  PRIMARY KEY (`IssueId`, `ProductId`, `BatchNo`),
  KEY `idx_outbound_detail_product_id` (`ProductId`),
  CONSTRAINT `fk_outbound_detail_issue`
    FOREIGN KEY (`IssueId`) REFERENCES `OutboundIssue` (`IssueId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_outbound_detail_product`
    FOREIGN KEY (`ProductId`) REFERENCES `Product` (`ProductId`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- DBMS objects for reports, derived data, reusable calculations, and data guards
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW `vw_current_tenants` AS
SELECT
  a.`AdminId`,
  a.`AdminName`,
  c.`CustomerId`,
  c.`CustomerName`,
  c.`UserName` AS `CustomerUserName`,
  c.`Email` AS `CustomerEmail`,
  c.`PhoneNumber`,
  w.`WarehouseId`,
  w.`WarehouseName`,
  lc.`ContractId`,
  lc.`StartDate`,
  lc.`EndDate`,
  lc.`RentalPrice`,
  lc.`Status`
FROM `LeaseContract` lc
JOIN `Customer` c ON c.`CustomerId` = lc.`CustomerId`
JOIN `Warehouse` w ON w.`WarehouseId` = lc.`WarehouseId`
JOIN `Admin` a ON a.`AdminId` = w.`AdminId`
WHERE lc.`Status` = 'Active'
  AND CURDATE() BETWEEN lc.`StartDate` AND lc.`EndDate`;

CREATE OR REPLACE VIEW `vw_inventory_summary` AS
SELECT
  p.`CustomerId`,
  c.`CustomerName`,
  i.`WarehouseId`,
  w.`WarehouseName`,
  i.`ProductId`,
  p.`ProductName`,
  p.`UnitOfMeasure`,
  p.`CategoryId`,
  cat.`CategoryName`,
  SUM(i.`Quantity`) AS `TotalQuantity`,
  p.`CurrentPrice`,
  SUM(i.`Quantity` * p.`CurrentPrice`) AS `TotalInventoryValue`,
  COUNT(*) AS `BatchCount`
FROM `Inventory` i
JOIN `Warehouse` w ON w.`WarehouseId` = i.`WarehouseId`
JOIN `Product` p ON p.`ProductId` = i.`ProductId`
JOIN `Customer` c ON c.`CustomerId` = p.`CustomerId`
JOIN `Category` cat ON cat.`CategoryId` = p.`CategoryId`
WHERE p.`IsDeleted` = FALSE
  AND cat.`IsDeleted` = FALSE
GROUP BY
  p.`CustomerId`,
  c.`CustomerName`,
  i.`WarehouseId`,
  w.`WarehouseName`,
  i.`ProductId`,
  p.`ProductName`,
  p.`UnitOfMeasure`,
  p.`CategoryId`,
  cat.`CategoryName`,
  p.`CurrentPrice`;

CREATE OR REPLACE VIEW `vw_expiring_batches` AS
SELECT
  p.`CustomerId`,
  c.`CustomerName`,
  i.`WarehouseId`,
  w.`WarehouseName`,
  i.`ProductId`,
  p.`ProductName`,
  i.`BatchNo`,
  i.`Quantity`,
  MIN(ird.`ExpiryDate`) AS `ExpiryDate`,
  DATEDIFF(MIN(ird.`ExpiryDate`), CURDATE()) AS `DaysUntilExpiry`,
  i.`Quantity` * p.`CurrentPrice` AS `InventoryValue`
FROM `Inventory` i
JOIN `Warehouse` w ON w.`WarehouseId` = i.`WarehouseId`
JOIN `Product` p ON p.`ProductId` = i.`ProductId`
JOIN `Customer` c ON c.`CustomerId` = p.`CustomerId`
JOIN `InboundReceipt` ir
  ON ir.`WarehouseId` = i.`WarehouseId`
 AND ir.`Status` = 'Completed'
JOIN `InboundReceiptDetail` ird
  ON ird.`ReceiptId` = ir.`ReceiptId`
 AND ird.`ProductId` = i.`ProductId`
 AND ird.`BatchNo` = i.`BatchNo`
WHERE i.`Quantity` > 0
  AND p.`IsDeleted` = FALSE
  AND ird.`ExpiryDate` IS NOT NULL
GROUP BY
  p.`CustomerId`,
  c.`CustomerName`,
  i.`WarehouseId`,
  w.`WarehouseName`,
  i.`ProductId`,
  p.`ProductName`,
  i.`BatchNo`,
  i.`Quantity`,
  p.`CurrentPrice`;

CREATE OR REPLACE VIEW `vw_monthly_product_exports` AS
SELECT
  b.`CustomerId`,
  c.`CustomerName`,
  oi.`WarehouseId`,
  w.`WarehouseName`,
  oid.`ProductId`,
  p.`ProductName`,
  YEAR(oi.`IssueDate`) AS `ExportYear`,
  MONTH(oi.`IssueDate`) AS `ExportMonth`,
  SUM(oid.`Quantity`) AS `TotalQuantityExported`,
  SUM(oid.`Quantity` * oid.`SellingPrice`) AS `TotalRevenue`
FROM `OutboundIssueDetail` oid
JOIN `OutboundIssue` oi ON oi.`IssueId` = oid.`IssueId`
JOIN `Buyer` b ON b.`BuyerId` = oi.`BuyerId`
JOIN `Customer` c ON c.`CustomerId` = b.`CustomerId`
JOIN `Warehouse` w ON w.`WarehouseId` = oi.`WarehouseId`
JOIN `Product` p ON p.`ProductId` = oid.`ProductId`
WHERE oi.`Status` = 'Completed'
  AND p.`IsDeleted` = FALSE
GROUP BY
  b.`CustomerId`,
  c.`CustomerName`,
  oi.`WarehouseId`,
  w.`WarehouseName`,
  oid.`ProductId`,
  p.`ProductName`,
  YEAR(oi.`IssueDate`),
  MONTH(oi.`IssueDate`);

DELIMITER $$

CREATE FUNCTION `fn_inventory_batch_value`(
  p_warehouse_id INT,
  p_product_id INT,
  p_batch_no VARCHAR(100)
)
RETURNS DECIMAL(18,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_value DECIMAL(18,2);

  SELECT COALESCE(SUM(i.`Quantity` * p.`CurrentPrice`), 0)
    INTO v_value
  FROM `Inventory` i
  JOIN `Product` p ON p.`ProductId` = i.`ProductId`
  WHERE i.`WarehouseId` = p_warehouse_id
    AND i.`ProductId` = p_product_id
    AND i.`BatchNo` = p_batch_no
    AND p.`IsDeleted` = FALSE;

  RETURN v_value;
END$$

CREATE FUNCTION `fn_customer_inventory_value`(p_customer_id INT)
RETURNS DECIMAL(18,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_total DECIMAL(18,2);

  SELECT COALESCE(SUM(i.`Quantity` * p.`CurrentPrice`), 0)
    INTO v_total
  FROM `Inventory` i
  JOIN `Product` p ON p.`ProductId` = i.`ProductId`
  WHERE p.`CustomerId` = p_customer_id
    AND p.`IsDeleted` = FALSE;

  RETURN v_total;
END$$

CREATE FUNCTION `fn_available_inventory`(
  p_warehouse_id INT,
  p_product_id INT,
  p_batch_no VARCHAR(100)
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_quantity INT DEFAULT 0;

  SELECT COALESCE(i.`Quantity`, 0)
    INTO v_quantity
  FROM `Inventory` i
  WHERE i.`WarehouseId` = p_warehouse_id
    AND i.`ProductId` = p_product_id
    AND i.`BatchNo` = p_batch_no
  LIMIT 1;

  RETURN COALESCE(v_quantity, 0);
END$$

CREATE PROCEDURE `sp_expire_lease_contracts`()
BEGIN
  UPDATE `LeaseContract`
  SET `Status` = 'Expired'
  WHERE `EndDate` < CURDATE()
    AND `Status` IN ('Pending', 'Active');

  SELECT ROW_COUNT() AS `ExpiredContracts`;
END$$

CREATE PROCEDURE `sp_get_current_tenants_by_admin`(IN p_admin_id INT)
BEGIN
  SELECT *
  FROM `vw_current_tenants`
  WHERE `AdminId` = p_admin_id
  ORDER BY `EndDate`, `CustomerName`, `WarehouseName`;
END$$

CREATE PROCEDURE `sp_get_customer_inventory_value`(IN p_customer_id INT)
BEGIN
  SELECT
    p_customer_id AS `CustomerId`,
    fn_customer_inventory_value(p_customer_id) AS `TotalInventoryValue`;
END$$

CREATE PROCEDURE `sp_get_expiring_batches`(
  IN p_customer_id INT,
  IN p_days_ahead INT
)
BEGIN
  DECLARE v_days_ahead INT DEFAULT 30;
  SET v_days_ahead = COALESCE(p_days_ahead, 30);

  SELECT *
  FROM `vw_expiring_batches`
  WHERE `CustomerId` = p_customer_id
    AND `DaysUntilExpiry` BETWEEN 0 AND v_days_ahead
  ORDER BY `ExpiryDate`, `ProductName`, `BatchNo`;
END$$

CREATE PROCEDURE `sp_get_top_exported_products`(
  IN p_customer_id INT,
  IN p_year INT,
  IN p_month INT,
  IN p_limit INT
)
BEGIN
  DECLARE v_limit INT DEFAULT 10;
  SET v_limit = COALESCE(NULLIF(p_limit, 0), 10);

  SELECT
    `CustomerId`,
    `CustomerName`,
    `ProductId`,
    `ProductName`,
    `ExportYear`,
    `ExportMonth`,
    SUM(`TotalQuantityExported`) AS `TotalQuantityExported`,
    SUM(`TotalRevenue`) AS `TotalRevenue`
  FROM `vw_monthly_product_exports`
  WHERE `CustomerId` = p_customer_id
    AND `ExportYear` = p_year
    AND `ExportMonth` = p_month
  GROUP BY
    `CustomerId`,
    `CustomerName`,
    `ProductId`,
    `ProductName`,
    `ExportYear`,
    `ExportMonth`
  ORDER BY `TotalQuantityExported` DESC, `TotalRevenue` DESC
  LIMIT v_limit;
END$$

CREATE PROCEDURE `sp_complete_inbound_receipt`(IN p_receipt_id INT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM `InboundReceipt` WHERE `ReceiptId` = p_receipt_id
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound receipt not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `InboundReceipt`
    WHERE `ReceiptId` = p_receipt_id
      AND `Status` = 'Cancelled'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cancelled inbound receipt cannot be completed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM `InboundReceiptDetail` WHERE `ReceiptId` = p_receipt_id
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound receipt has no details';
  END IF;

  UPDATE `InboundReceipt`
  SET `Status` = 'Completed'
  WHERE `ReceiptId` = p_receipt_id
    AND `Status` <> 'Completed';

  SELECT * FROM `InboundReceipt` WHERE `ReceiptId` = p_receipt_id;
END$$

CREATE PROCEDURE `sp_complete_outbound_issue`(IN p_issue_id INT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM `OutboundIssue` WHERE `IssueId` = p_issue_id
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound issue not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `OutboundIssue`
    WHERE `IssueId` = p_issue_id
      AND `Status` = 'Cancelled'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cancelled outbound issue cannot be completed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM `OutboundIssueDetail` WHERE `IssueId` = p_issue_id
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound issue has no details';
  END IF;

  UPDATE `OutboundIssue`
  SET `Status` = 'Completed'
  WHERE `IssueId` = p_issue_id
    AND `Status` <> 'Completed';

  SELECT * FROM `OutboundIssue` WHERE `IssueId` = p_issue_id;
END$$

CREATE TRIGGER `trg_warehouse_bi_validate`
BEFORE INSERT ON `Warehouse`
FOR EACH ROW
BEGIN
  SET NEW.`WarehouseName` = TRIM(NEW.`WarehouseName`);

  IF NEW.`WarehouseName` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse name is required';
  END IF;

  IF NEW.`Area` IS NOT NULL AND NEW.`Area` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse area must be greater than zero';
  END IF;

  IF NEW.`RentalPrice` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse rental price must be greater than zero';
  END IF;
END$$

CREATE TRIGGER `trg_warehouse_bu_validate`
BEFORE UPDATE ON `Warehouse`
FOR EACH ROW
BEGIN
  SET NEW.`WarehouseName` = TRIM(NEW.`WarehouseName`);

  IF NEW.`WarehouseName` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse name is required';
  END IF;

  IF NEW.`Area` IS NOT NULL AND NEW.`Area` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse area must be greater than zero';
  END IF;

  IF NEW.`RentalPrice` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse rental price must be greater than zero';
  END IF;
END$$

CREATE TRIGGER `trg_lease_contract_bi_validate`
BEFORE INSERT ON `LeaseContract`
FOR EACH ROW
BEGIN
  IF NEW.`EndDate` < NEW.`StartDate` THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lease contract end date must be on or after start date';
  END IF;

  IF NEW.`Status` IN ('Pending', 'Active') AND NEW.`EndDate` < CURDATE() THEN
    SET NEW.`Status` = 'Expired';
  END IF;
END$$

CREATE TRIGGER `trg_lease_contract_bu_validate`
BEFORE UPDATE ON `LeaseContract`
FOR EACH ROW
BEGIN
  IF NEW.`EndDate` < NEW.`StartDate` THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lease contract end date must be on or after start date';
  END IF;

  IF NEW.`Status` IN ('Pending', 'Active') AND NEW.`EndDate` < CURDATE() THEN
    SET NEW.`Status` = 'Expired';
  END IF;
END$$

CREATE TRIGGER `trg_product_bi_validate`
BEFORE INSERT ON `Product`
FOR EACH ROW
BEGIN
  SET NEW.`ProductName` = TRIM(NEW.`ProductName`);
  SET NEW.`UnitOfMeasure` = TRIM(NEW.`UnitOfMeasure`);

  IF NEW.`ProductName` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product name is required';
  END IF;

  IF NEW.`UnitOfMeasure` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product unit of measure is required';
  END IF;

  IF NEW.`CurrentPrice` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product current price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_product_bu_validate`
BEFORE UPDATE ON `Product`
FOR EACH ROW
BEGIN
  SET NEW.`ProductName` = TRIM(NEW.`ProductName`);
  SET NEW.`UnitOfMeasure` = TRIM(NEW.`UnitOfMeasure`);

  IF NEW.`ProductName` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product name is required';
  END IF;

  IF NEW.`UnitOfMeasure` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product unit of measure is required';
  END IF;

  IF NEW.`CurrentPrice` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product current price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_bi_validate`
BEFORE INSERT ON `InboundReceiptDetail`
FOR EACH ROW
BEGIN
  SET NEW.`BatchNo` = TRIM(NEW.`BatchNo`);

  IF NEW.`BatchNo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound batch number is required';
  END IF;

  IF NEW.`Quantity` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound quantity must be greater than zero';
  END IF;

  IF NEW.`ImportPrice` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound import price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_bu_validate`
BEFORE UPDATE ON `InboundReceiptDetail`
FOR EACH ROW
BEGIN
  SET NEW.`BatchNo` = TRIM(NEW.`BatchNo`);

  IF NEW.`BatchNo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound batch number is required';
  END IF;

  IF NEW.`Quantity` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound quantity must be greater than zero';
  END IF;

  IF NEW.`ImportPrice` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound import price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_inbound_receipt_au_inventory`
AFTER UPDATE ON `InboundReceipt`
FOR EACH ROW
BEGIN
  IF OLD.`Status` = 'Completed'
     AND (NEW.`Status` <> 'Completed' OR OLD.`WarehouseId` <> NEW.`WarehouseId`) THEN
    IF EXISTS (
      SELECT 1
      FROM `InboundReceiptDetail` d
      LEFT JOIN `Inventory` i
        ON i.`WarehouseId` = OLD.`WarehouseId`
       AND i.`ProductId` = d.`ProductId`
       AND i.`BatchNo` = d.`BatchNo`
      WHERE d.`ReceiptId` = OLD.`ReceiptId`
        AND COALESCE(i.`Quantity`, 0) < d.`Quantity`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot reverse inbound receipt because inventory would become negative';
    END IF;

    UPDATE `Inventory` i
    JOIN `InboundReceiptDetail` d
      ON d.`ReceiptId` = OLD.`ReceiptId`
     AND d.`ProductId` = i.`ProductId`
     AND d.`BatchNo` = i.`BatchNo`
    SET i.`Quantity` = i.`Quantity` - d.`Quantity`,
        i.`LastUpdated` = NOW()
    WHERE i.`WarehouseId` = OLD.`WarehouseId`;
  END IF;

  IF NEW.`Status` = 'Completed'
     AND (OLD.`Status` <> 'Completed' OR OLD.`WarehouseId` <> NEW.`WarehouseId`) THEN
    IF NOT EXISTS (
      SELECT 1 FROM `InboundReceiptDetail` WHERE `ReceiptId` = NEW.`ReceiptId`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound receipt has no details';
    END IF;

    INSERT INTO `Inventory` (`WarehouseId`, `ProductId`, `BatchNo`, `Quantity`, `LastUpdated`)
    SELECT NEW.`WarehouseId`, d.`ProductId`, d.`BatchNo`, d.`Quantity`, NOW()
    FROM `InboundReceiptDetail` d
    WHERE d.`ReceiptId` = NEW.`ReceiptId`
    ON DUPLICATE KEY UPDATE
      `Quantity` = `Inventory`.`Quantity` + VALUES(`Quantity`),
      `LastUpdated` = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_ai_inventory`
AFTER INSERT ON `InboundReceiptDetail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT ir.`WarehouseId`, ir.`Status`
    INTO v_warehouse_id, v_status
  FROM `InboundReceipt` ir
  WHERE ir.`ReceiptId` = NEW.`ReceiptId`;

  IF v_status = 'Completed' THEN
    INSERT INTO `Inventory` (`WarehouseId`, `ProductId`, `BatchNo`, `Quantity`, `LastUpdated`)
    VALUES (v_warehouse_id, NEW.`ProductId`, NEW.`BatchNo`, NEW.`Quantity`, NOW())
    ON DUPLICATE KEY UPDATE
      `Quantity` = `Inventory`.`Quantity` + VALUES(`Quantity`),
      `LastUpdated` = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_au_inventory`
AFTER UPDATE ON `InboundReceiptDetail`
FOR EACH ROW
BEGIN
  DECLARE v_old_warehouse_id INT;
  DECLARE v_new_warehouse_id INT;
  DECLARE v_old_status VARCHAR(20);
  DECLARE v_new_status VARCHAR(20);

  SELECT ir.`WarehouseId`, ir.`Status`
    INTO v_old_warehouse_id, v_old_status
  FROM `InboundReceipt` ir
  WHERE ir.`ReceiptId` = OLD.`ReceiptId`;

  SELECT ir.`WarehouseId`, ir.`Status`
    INTO v_new_warehouse_id, v_new_status
  FROM `InboundReceipt` ir
  WHERE ir.`ReceiptId` = NEW.`ReceiptId`;

  IF v_old_status = 'Completed' THEN
    IF fn_available_inventory(v_old_warehouse_id, OLD.`ProductId`, OLD.`BatchNo`) < OLD.`Quantity` THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot update inbound detail because inventory would become negative';
    END IF;

    UPDATE `Inventory`
    SET `Quantity` = `Quantity` - OLD.`Quantity`,
        `LastUpdated` = NOW()
    WHERE `WarehouseId` = v_old_warehouse_id
      AND `ProductId` = OLD.`ProductId`
      AND `BatchNo` = OLD.`BatchNo`;
  END IF;

  IF v_new_status = 'Completed' THEN
    INSERT INTO `Inventory` (`WarehouseId`, `ProductId`, `BatchNo`, `Quantity`, `LastUpdated`)
    VALUES (v_new_warehouse_id, NEW.`ProductId`, NEW.`BatchNo`, NEW.`Quantity`, NOW())
    ON DUPLICATE KEY UPDATE
      `Quantity` = `Inventory`.`Quantity` + VALUES(`Quantity`),
      `LastUpdated` = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_ad_inventory`
AFTER DELETE ON `InboundReceiptDetail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT ir.`WarehouseId`, ir.`Status`
    INTO v_warehouse_id, v_status
  FROM `InboundReceipt` ir
  WHERE ir.`ReceiptId` = OLD.`ReceiptId`;

  IF v_status = 'Completed' THEN
    IF fn_available_inventory(v_warehouse_id, OLD.`ProductId`, OLD.`BatchNo`) < OLD.`Quantity` THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete inbound detail because inventory would become negative';
    END IF;

    UPDATE `Inventory`
    SET `Quantity` = `Quantity` - OLD.`Quantity`,
        `LastUpdated` = NOW()
    WHERE `WarehouseId` = v_warehouse_id
      AND `ProductId` = OLD.`ProductId`
      AND `BatchNo` = OLD.`BatchNo`;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_bi_validate`
BEFORE INSERT ON `OutboundIssueDetail`
FOR EACH ROW
BEGIN
  SET NEW.`BatchNo` = TRIM(NEW.`BatchNo`);

  IF NEW.`BatchNo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound batch number is required';
  END IF;

  IF NEW.`Quantity` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound quantity must be greater than zero';
  END IF;

  IF NEW.`SellingPrice` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound selling price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_bu_validate`
BEFORE UPDATE ON `OutboundIssueDetail`
FOR EACH ROW
BEGIN
  SET NEW.`BatchNo` = TRIM(NEW.`BatchNo`);

  IF NEW.`BatchNo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound batch number is required';
  END IF;

  IF NEW.`Quantity` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound quantity must be greater than zero';
  END IF;

  IF NEW.`SellingPrice` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound selling price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_outbound_issue_bu_check_inventory`
BEFORE UPDATE ON `OutboundIssue`
FOR EACH ROW
BEGIN
  IF NEW.`Status` = 'Completed'
     AND (OLD.`Status` <> 'Completed' OR OLD.`WarehouseId` <> NEW.`WarehouseId`) THEN
    IF NOT EXISTS (
      SELECT 1 FROM `OutboundIssueDetail` WHERE `IssueId` = NEW.`IssueId`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound issue has no details';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM (
        SELECT d.`ProductId`, d.`BatchNo`, SUM(d.`Quantity`) AS `RequestedQuantity`
        FROM `OutboundIssueDetail` d
        WHERE d.`IssueId` = NEW.`IssueId`
        GROUP BY d.`ProductId`, d.`BatchNo`
      ) x
      LEFT JOIN `Inventory` i
        ON i.`WarehouseId` = NEW.`WarehouseId`
       AND i.`ProductId` = x.`ProductId`
       AND i.`BatchNo` = x.`BatchNo`
      WHERE COALESCE(i.`Quantity`, 0) < x.`RequestedQuantity`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient inventory to complete outbound issue';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_issue_au_inventory`
AFTER UPDATE ON `OutboundIssue`
FOR EACH ROW
BEGIN
  IF OLD.`Status` = 'Completed'
     AND (NEW.`Status` <> 'Completed' OR OLD.`WarehouseId` <> NEW.`WarehouseId`) THEN
    INSERT INTO `Inventory` (`WarehouseId`, `ProductId`, `BatchNo`, `Quantity`, `LastUpdated`)
    SELECT OLD.`WarehouseId`, d.`ProductId`, d.`BatchNo`, d.`Quantity`, NOW()
    FROM `OutboundIssueDetail` d
    WHERE d.`IssueId` = OLD.`IssueId`
    ON DUPLICATE KEY UPDATE
      `Quantity` = `Inventory`.`Quantity` + VALUES(`Quantity`),
      `LastUpdated` = NOW();
  END IF;

  IF NEW.`Status` = 'Completed'
     AND (OLD.`Status` <> 'Completed' OR OLD.`WarehouseId` <> NEW.`WarehouseId`) THEN
    UPDATE `Inventory` i
    JOIN (
      SELECT d.`ProductId`, d.`BatchNo`, SUM(d.`Quantity`) AS `RequestedQuantity`
      FROM `OutboundIssueDetail` d
      WHERE d.`IssueId` = NEW.`IssueId`
      GROUP BY d.`ProductId`, d.`BatchNo`
    ) x
      ON x.`ProductId` = i.`ProductId`
     AND x.`BatchNo` = i.`BatchNo`
    SET i.`Quantity` = i.`Quantity` - x.`RequestedQuantity`,
        i.`LastUpdated` = NOW()
    WHERE i.`WarehouseId` = NEW.`WarehouseId`;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_bi_check_inventory`
BEFORE INSERT ON `OutboundIssueDetail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT oi.`WarehouseId`, oi.`Status`
    INTO v_warehouse_id, v_status
  FROM `OutboundIssue` oi
  WHERE oi.`IssueId` = NEW.`IssueId`;

  IF v_status = 'Completed'
     AND fn_available_inventory(v_warehouse_id, NEW.`ProductId`, TRIM(NEW.`BatchNo`)) < NEW.`Quantity` THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient inventory for outbound detail';
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_bu_check_inventory`
BEFORE UPDATE ON `OutboundIssueDetail`
FOR EACH ROW
BEGIN
  DECLARE v_old_warehouse_id INT;
  DECLARE v_new_warehouse_id INT;
  DECLARE v_old_status VARCHAR(20);
  DECLARE v_new_status VARCHAR(20);
  DECLARE v_available INT DEFAULT 0;

  SELECT oi.`WarehouseId`, oi.`Status`
    INTO v_old_warehouse_id, v_old_status
  FROM `OutboundIssue` oi
  WHERE oi.`IssueId` = OLD.`IssueId`;

  SELECT oi.`WarehouseId`, oi.`Status`
    INTO v_new_warehouse_id, v_new_status
  FROM `OutboundIssue` oi
  WHERE oi.`IssueId` = NEW.`IssueId`;

  IF v_new_status = 'Completed' THEN
    SET v_available = fn_available_inventory(v_new_warehouse_id, NEW.`ProductId`, TRIM(NEW.`BatchNo`));

    IF v_old_status = 'Completed'
       AND v_old_warehouse_id = v_new_warehouse_id
       AND OLD.`ProductId` = NEW.`ProductId`
       AND OLD.`BatchNo` = TRIM(NEW.`BatchNo`) THEN
      SET v_available = v_available + OLD.`Quantity`;
    END IF;

    IF v_available < NEW.`Quantity` THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient inventory for outbound detail update';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_ai_inventory`
AFTER INSERT ON `OutboundIssueDetail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT oi.`WarehouseId`, oi.`Status`
    INTO v_warehouse_id, v_status
  FROM `OutboundIssue` oi
  WHERE oi.`IssueId` = NEW.`IssueId`;

  IF v_status = 'Completed' THEN
    UPDATE `Inventory`
    SET `Quantity` = `Quantity` - NEW.`Quantity`,
        `LastUpdated` = NOW()
    WHERE `WarehouseId` = v_warehouse_id
      AND `ProductId` = NEW.`ProductId`
      AND `BatchNo` = NEW.`BatchNo`;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_au_inventory`
AFTER UPDATE ON `OutboundIssueDetail`
FOR EACH ROW
BEGIN
  DECLARE v_old_warehouse_id INT;
  DECLARE v_new_warehouse_id INT;
  DECLARE v_old_status VARCHAR(20);
  DECLARE v_new_status VARCHAR(20);

  SELECT oi.`WarehouseId`, oi.`Status`
    INTO v_old_warehouse_id, v_old_status
  FROM `OutboundIssue` oi
  WHERE oi.`IssueId` = OLD.`IssueId`;

  SELECT oi.`WarehouseId`, oi.`Status`
    INTO v_new_warehouse_id, v_new_status
  FROM `OutboundIssue` oi
  WHERE oi.`IssueId` = NEW.`IssueId`;

  IF v_old_status = 'Completed' THEN
    INSERT INTO `Inventory` (`WarehouseId`, `ProductId`, `BatchNo`, `Quantity`, `LastUpdated`)
    VALUES (v_old_warehouse_id, OLD.`ProductId`, OLD.`BatchNo`, OLD.`Quantity`, NOW())
    ON DUPLICATE KEY UPDATE
      `Quantity` = `Inventory`.`Quantity` + VALUES(`Quantity`),
      `LastUpdated` = NOW();
  END IF;

  IF v_new_status = 'Completed' THEN
    UPDATE `Inventory`
    SET `Quantity` = `Quantity` - NEW.`Quantity`,
        `LastUpdated` = NOW()
    WHERE `WarehouseId` = v_new_warehouse_id
      AND `ProductId` = NEW.`ProductId`
      AND `BatchNo` = NEW.`BatchNo`;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_ad_inventory`
AFTER DELETE ON `OutboundIssueDetail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT oi.`WarehouseId`, oi.`Status`
    INTO v_warehouse_id, v_status
  FROM `OutboundIssue` oi
  WHERE oi.`IssueId` = OLD.`IssueId`;

  IF v_status = 'Completed' THEN
    INSERT INTO `Inventory` (`WarehouseId`, `ProductId`, `BatchNo`, `Quantity`, `LastUpdated`)
    VALUES (v_warehouse_id, OLD.`ProductId`, OLD.`BatchNo`, OLD.`Quantity`, NOW())
    ON DUPLICATE KEY UPDATE
      `Quantity` = `Inventory`.`Quantity` + VALUES(`Quantity`),
      `LastUpdated` = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_inventory_bi_validate`
BEFORE INSERT ON `Inventory`
FOR EACH ROW
BEGIN
  SET NEW.`BatchNo` = TRIM(NEW.`BatchNo`);

  IF NEW.`BatchNo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory batch number is required';
  END IF;

  IF NEW.`Quantity` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory quantity cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_inventory_bu_validate`
BEFORE UPDATE ON `Inventory`
FOR EACH ROW
BEGIN
  SET NEW.`BatchNo` = TRIM(NEW.`BatchNo`);

  IF NEW.`BatchNo` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory batch number is required';
  END IF;

  IF NEW.`Quantity` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory quantity cannot be negative';
  END IF;
END$$

DELIMITER ;
