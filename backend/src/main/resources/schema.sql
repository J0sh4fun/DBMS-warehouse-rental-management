-- Warehouse Rental & Logistics Management System
-- MySQL 8+ schema generated from DBML with architectural constraints.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `OutboundIssueDetail`;
DROP TABLE IF EXISTS `OutboundIssue`;
DROP TABLE IF EXISTS `InboundReceiptDetail`;
DROP TABLE IF EXISTS `InboundReceipt`;
DROP TABLE IF EXISTS `Inventory`;
DROP TABLE IF EXISTS `Product`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `Supplier`;
DROP TABLE IF EXISTS `Buyer`;
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

