-- Additional DBMS objects for the Hibernate-created MySQL schema.
-- This full DBMS demo script includes automatic inventory increase/decrease
-- triggers. Do not apply it to the same database while Java services are also
-- updating inventory, otherwise inbound/outbound stock can be updated twice.
-- It does not drop or recreate data tables.

SET NAMES utf8mb4;

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

CREATE OR REPLACE VIEW `vw_current_tenants` AS
SELECT
  a.`admin_id`,
  a.`admin_name`,
  c.`customer_id`,
  c.`customer_name`,
  c.`user_name` AS `customer_user_name`,
  c.`email` AS `customer_email`,
  c.`phone_number`,
  w.`warehouse_id`,
  w.`warehouse_name`,
  lc.`contract_id`,
  lc.`start_date`,
  lc.`end_date`,
  lc.`rental_price`,
  lc.`status`
FROM `lease_contract` lc
JOIN `customer` c ON c.`customer_id` = lc.`customer_id`
JOIN `warehouse` w ON w.`warehouse_id` = lc.`warehouse_id`
JOIN `admin` a ON a.`admin_id` = w.`admin_id`
WHERE lc.`status` = 'Active'
  AND CURDATE() BETWEEN lc.`start_date` AND lc.`end_date`;

CREATE OR REPLACE VIEW `vw_inventory_summary` AS
SELECT
  p.`customer_id`,
  c.`customer_name`,
  i.`warehouse_id`,
  w.`warehouse_name`,
  i.`product_id`,
  p.`product_name`,
  p.`unit_of_measure`,
  p.`category_id`,
  cat.`category_name`,
  SUM(i.`quantity`) AS `total_quantity`,
  p.`current_price`,
  SUM(i.`quantity` * p.`current_price`) AS `total_inventory_value`,
  COUNT(*) AS `batch_count`
FROM `inventory` i
JOIN `warehouse` w ON w.`warehouse_id` = i.`warehouse_id`
JOIN `product` p ON p.`product_id` = i.`product_id`
JOIN `customer` c ON c.`customer_id` = p.`customer_id`
JOIN `category` cat ON cat.`category_id` = p.`category_id`
WHERE p.`is_deleted` = FALSE
  AND cat.`is_deleted` = FALSE
GROUP BY
  p.`customer_id`,
  c.`customer_name`,
  i.`warehouse_id`,
  w.`warehouse_name`,
  i.`product_id`,
  p.`product_name`,
  p.`unit_of_measure`,
  p.`category_id`,
  cat.`category_name`,
  p.`current_price`;

CREATE OR REPLACE VIEW `vw_expiring_batches` AS
SELECT
  p.`customer_id`,
  c.`customer_name`,
  ir.`receipt_id`,
  ir.`warehouse_id`,
  w.`warehouse_name`,
  s.`supplier_id`,
  s.`supplier_name`,
  ird.`product_id`,
  p.`product_name`,
  ird.`batch_no`,
  i.`quantity` AS `current_quantity`,
  ird.`expiry_date`,
  DATEDIFF(ird.`expiry_date`, CURDATE()) AS `days_until_expiry`,
  i.`quantity` * p.`current_price` AS `inventory_value`
FROM `inbound_receipt_detail` ird
JOIN `inbound_receipt` ir
  ON ir.`receipt_id` = ird.`receipt_id`
 AND ir.`status` = 'Completed'
JOIN `warehouse` w ON w.`warehouse_id` = ir.`warehouse_id`
JOIN `supplier` s ON s.`supplier_id` = ir.`supplier_id`
JOIN `product` p ON p.`product_id` = ird.`product_id`
JOIN `customer` c ON c.`customer_id` = p.`customer_id`
JOIN `inventory` i
  ON i.`warehouse_id` = ir.`warehouse_id`
 AND i.`product_id` = ird.`product_id`
 AND i.`batch_no` = ird.`batch_no`
WHERE i.`quantity` > 0
  AND p.`is_deleted` = FALSE
  AND ird.`expiry_date` IS NOT NULL;

CREATE OR REPLACE VIEW `vw_monthly_product_exports` AS
SELECT
  b.`customer_id`,
  c.`customer_name`,
  oi.`warehouse_id`,
  w.`warehouse_name`,
  oid.`product_id`,
  p.`product_name`,
  YEAR(oi.`issue_date`) AS `export_year`,
  MONTH(oi.`issue_date`) AS `export_month`,
  SUM(oid.`quantity`) AS `total_quantity_exported`,
  SUM(oid.`quantity` * oid.`selling_price`) AS `total_revenue`
FROM `outbound_issue_detail` oid
JOIN `outbound_issue` oi ON oi.`issue_id` = oid.`issue_id`
JOIN `buyer` b ON b.`buyer_id` = oi.`buyer_id`
JOIN `customer` c ON c.`customer_id` = b.`customer_id`
JOIN `warehouse` w ON w.`warehouse_id` = oi.`warehouse_id`
JOIN `product` p ON p.`product_id` = oid.`product_id`
WHERE oi.`status` = 'Completed'
  AND p.`is_deleted` = FALSE
GROUP BY
  b.`customer_id`,
  c.`customer_name`,
  oi.`warehouse_id`,
  w.`warehouse_name`,
  oid.`product_id`,
  p.`product_name`,
  YEAR(oi.`issue_date`),
  MONTH(oi.`issue_date`);

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

  SELECT COALESCE(SUM(i.`quantity` * p.`current_price`), 0)
    INTO v_value
  FROM `inventory` i
  JOIN `product` p ON p.`product_id` = i.`product_id`
  WHERE i.`warehouse_id` = p_warehouse_id
    AND i.`product_id` = p_product_id
    AND i.`batch_no` = p_batch_no
    AND p.`is_deleted` = FALSE;

  RETURN v_value;
END$$

CREATE FUNCTION `fn_customer_inventory_value`(p_customer_id INT)
RETURNS DECIMAL(18,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_total DECIMAL(18,2);

  SELECT COALESCE(SUM(i.`quantity` * p.`current_price`), 0)
    INTO v_total
  FROM `inventory` i
  JOIN `product` p ON p.`product_id` = i.`product_id`
  WHERE p.`customer_id` = p_customer_id
    AND p.`is_deleted` = FALSE;

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

  SELECT COALESCE(i.`quantity`, 0)
    INTO v_quantity
  FROM `inventory` i
  WHERE i.`warehouse_id` = p_warehouse_id
    AND i.`product_id` = p_product_id
    AND i.`batch_no` = p_batch_no
  LIMIT 1;

  RETURN COALESCE(v_quantity, 0);
END$$

CREATE PROCEDURE `sp_expire_lease_contracts`()
BEGIN
  UPDATE `lease_contract`
  SET `status` = 'Expired'
  WHERE `end_date` < CURDATE()
    AND `status` IN ('Pending', 'Active');

  SELECT ROW_COUNT() AS `expired_contracts`;
END$$

CREATE PROCEDURE `sp_get_current_tenants_by_admin`(IN p_admin_id INT)
BEGIN
  SELECT *
  FROM `vw_current_tenants`
  WHERE `admin_id` = p_admin_id
  ORDER BY `end_date`, `customer_name`, `warehouse_name`;
END$$

CREATE PROCEDURE `sp_get_customer_inventory_value`(IN p_customer_id INT)
BEGIN
  SELECT
    p_customer_id AS `customer_id`,
    fn_customer_inventory_value(p_customer_id) AS `total_inventory_value`;
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
  WHERE `customer_id` = p_customer_id
    AND `days_until_expiry` BETWEEN 0 AND v_days_ahead
  ORDER BY `expiry_date`, `product_name`, `batch_no`;
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
    `customer_id`,
    `customer_name`,
    `product_id`,
    `product_name`,
    `export_year`,
    `export_month`,
    SUM(`total_quantity_exported`) AS `total_quantity_exported`,
    SUM(`total_revenue`) AS `total_revenue`
  FROM `vw_monthly_product_exports`
  WHERE `customer_id` = p_customer_id
    AND `export_year` = p_year
    AND `export_month` = p_month
  GROUP BY
    `customer_id`,
    `customer_name`,
    `product_id`,
    `product_name`,
    `export_year`,
    `export_month`
  ORDER BY `total_quantity_exported` DESC, `total_revenue` DESC
  LIMIT v_limit;
END$$

CREATE PROCEDURE `sp_complete_inbound_receipt`(IN p_receipt_id INT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM `inbound_receipt` WHERE `receipt_id` = p_receipt_id
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound receipt not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `inbound_receipt`
    WHERE `receipt_id` = p_receipt_id
      AND `status` = 'Cancelled'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cancelled inbound receipt cannot be completed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM `inbound_receipt_detail` WHERE `receipt_id` = p_receipt_id
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound receipt has no details';
  END IF;

  UPDATE `inbound_receipt`
  SET `status` = 'Completed'
  WHERE `receipt_id` = p_receipt_id
    AND `status` <> 'Completed';

  SELECT * FROM `inbound_receipt` WHERE `receipt_id` = p_receipt_id;
END$$

CREATE PROCEDURE `sp_complete_outbound_issue`(IN p_issue_id INT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM `outbound_issue` WHERE `issue_id` = p_issue_id
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound issue not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `outbound_issue`
    WHERE `issue_id` = p_issue_id
      AND `status` = 'Cancelled'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cancelled outbound issue cannot be completed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM `outbound_issue_detail` WHERE `issue_id` = p_issue_id
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound issue has no details';
  END IF;

  UPDATE `outbound_issue`
  SET `status` = 'Completed'
  WHERE `issue_id` = p_issue_id
    AND `status` <> 'Completed';

  SELECT * FROM `outbound_issue` WHERE `issue_id` = p_issue_id;
END$$

CREATE TRIGGER `trg_warehouse_bi_validate`
BEFORE INSERT ON `warehouse`
FOR EACH ROW
BEGIN
  SET NEW.`warehouse_name` = TRIM(NEW.`warehouse_name`);

  IF NEW.`warehouse_name` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse name is required';
  END IF;

  IF NEW.`area` IS NOT NULL AND NEW.`area` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse area must be greater than zero';
  END IF;
END$$

CREATE TRIGGER `trg_warehouse_bu_validate`
BEFORE UPDATE ON `warehouse`
FOR EACH ROW
BEGIN
  SET NEW.`warehouse_name` = TRIM(NEW.`warehouse_name`);

  IF NEW.`warehouse_name` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse name is required';
  END IF;

  IF NEW.`area` IS NOT NULL AND NEW.`area` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warehouse area must be greater than zero';
  END IF;
END$$

CREATE TRIGGER `trg_lease_contract_bi_validate`
BEFORE INSERT ON `lease_contract`
FOR EACH ROW
BEGIN
  IF NEW.`end_date` < NEW.`start_date` THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lease contract end date must be on or after start date';
  END IF;

  IF NEW.`status` IN ('Pending', 'Active') AND NEW.`end_date` < CURDATE() THEN
    SET NEW.`status` = 'Expired';
  END IF;
END$$

CREATE TRIGGER `trg_lease_contract_bu_validate`
BEFORE UPDATE ON `lease_contract`
FOR EACH ROW
BEGIN
  IF NEW.`end_date` < NEW.`start_date` THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lease contract end date must be on or after start date';
  END IF;

  IF NEW.`status` IN ('Pending', 'Active') AND NEW.`end_date` < CURDATE() THEN
    SET NEW.`status` = 'Expired';
  END IF;
END$$

CREATE TRIGGER `trg_product_bi_validate`
BEFORE INSERT ON `product`
FOR EACH ROW
BEGIN
  SET NEW.`product_name` = TRIM(NEW.`product_name`);
  SET NEW.`unit_of_measure` = TRIM(NEW.`unit_of_measure`);

  IF NEW.`product_name` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product name is required';
  END IF;

  IF NEW.`unit_of_measure` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product unit of measure is required';
  END IF;

  IF NEW.`current_price` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product current price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_product_bu_validate`
BEFORE UPDATE ON `product`
FOR EACH ROW
BEGIN
  SET NEW.`product_name` = TRIM(NEW.`product_name`);
  SET NEW.`unit_of_measure` = TRIM(NEW.`unit_of_measure`);

  IF NEW.`product_name` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product name is required';
  END IF;

  IF NEW.`unit_of_measure` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product unit of measure is required';
  END IF;

  IF NEW.`current_price` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product current price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_bi_validate`
BEFORE INSERT ON `inbound_receipt_detail`
FOR EACH ROW
BEGIN
  SET NEW.`batch_no` = TRIM(NEW.`batch_no`);

  IF NEW.`batch_no` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound batch number is required';
  END IF;

  IF NEW.`quantity` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound quantity must be greater than zero';
  END IF;

  IF NEW.`import_price` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound import price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_bu_validate`
BEFORE UPDATE ON `inbound_receipt_detail`
FOR EACH ROW
BEGIN
  SET NEW.`batch_no` = TRIM(NEW.`batch_no`);

  IF NEW.`batch_no` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound batch number is required';
  END IF;

  IF NEW.`quantity` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound quantity must be greater than zero';
  END IF;

  IF NEW.`import_price` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound import price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_inbound_receipt_au_inventory`
AFTER UPDATE ON `inbound_receipt`
FOR EACH ROW
BEGIN
  IF OLD.`status` = 'Completed'
     AND (NEW.`status` <> 'Completed' OR OLD.`warehouse_id` <> NEW.`warehouse_id`) THEN
    IF EXISTS (
      SELECT 1
      FROM `inbound_receipt_detail` d
      LEFT JOIN `inventory` i
        ON i.`warehouse_id` = OLD.`warehouse_id`
       AND i.`product_id` = d.`product_id`
       AND i.`batch_no` = d.`batch_no`
      WHERE d.`receipt_id` = OLD.`receipt_id`
        AND COALESCE(i.`quantity`, 0) < d.`quantity`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot reverse inbound receipt because inventory would become negative';
    END IF;

    UPDATE `inventory` i
    JOIN `inbound_receipt_detail` d
      ON d.`receipt_id` = OLD.`receipt_id`
     AND d.`product_id` = i.`product_id`
     AND d.`batch_no` = i.`batch_no`
    SET i.`quantity` = i.`quantity` - d.`quantity`,
        i.`last_updated` = NOW()
    WHERE i.`warehouse_id` = OLD.`warehouse_id`;
  END IF;

  IF NEW.`status` = 'Completed'
     AND (OLD.`status` <> 'Completed' OR OLD.`warehouse_id` <> NEW.`warehouse_id`) THEN
    IF NOT EXISTS (
      SELECT 1 FROM `inbound_receipt_detail` WHERE `receipt_id` = NEW.`receipt_id`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inbound receipt has no details';
    END IF;

    INSERT INTO `inventory` (`warehouse_id`, `product_id`, `batch_no`, `quantity`, `last_updated`)
    SELECT NEW.`warehouse_id`, d.`product_id`, d.`batch_no`, d.`quantity`, NOW()
    FROM `inbound_receipt_detail` d
    WHERE d.`receipt_id` = NEW.`receipt_id`
    ON DUPLICATE KEY UPDATE
      `quantity` = `inventory`.`quantity` + VALUES(`quantity`),
      `last_updated` = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_ai_inventory`
AFTER INSERT ON `inbound_receipt_detail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT ir.`warehouse_id`, ir.`status`
    INTO v_warehouse_id, v_status
  FROM `inbound_receipt` ir
  WHERE ir.`receipt_id` = NEW.`receipt_id`;

  IF v_status = 'Completed' THEN
    INSERT INTO `inventory` (`warehouse_id`, `product_id`, `batch_no`, `quantity`, `last_updated`)
    VALUES (v_warehouse_id, NEW.`product_id`, NEW.`batch_no`, NEW.`quantity`, NOW())
    ON DUPLICATE KEY UPDATE
      `quantity` = `inventory`.`quantity` + VALUES(`quantity`),
      `last_updated` = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_au_inventory`
AFTER UPDATE ON `inbound_receipt_detail`
FOR EACH ROW
BEGIN
  DECLARE v_old_warehouse_id INT;
  DECLARE v_new_warehouse_id INT;
  DECLARE v_old_status VARCHAR(20);
  DECLARE v_new_status VARCHAR(20);

  SELECT ir.`warehouse_id`, ir.`status`
    INTO v_old_warehouse_id, v_old_status
  FROM `inbound_receipt` ir
  WHERE ir.`receipt_id` = OLD.`receipt_id`;

  SELECT ir.`warehouse_id`, ir.`status`
    INTO v_new_warehouse_id, v_new_status
  FROM `inbound_receipt` ir
  WHERE ir.`receipt_id` = NEW.`receipt_id`;

  IF v_old_status = 'Completed' THEN
    IF fn_available_inventory(v_old_warehouse_id, OLD.`product_id`, OLD.`batch_no`) < OLD.`quantity` THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot update inbound detail because inventory would become negative';
    END IF;

    UPDATE `inventory`
    SET `quantity` = `quantity` - OLD.`quantity`,
        `last_updated` = NOW()
    WHERE `warehouse_id` = v_old_warehouse_id
      AND `product_id` = OLD.`product_id`
      AND `batch_no` = OLD.`batch_no`;
  END IF;

  IF v_new_status = 'Completed' THEN
    INSERT INTO `inventory` (`warehouse_id`, `product_id`, `batch_no`, `quantity`, `last_updated`)
    VALUES (v_new_warehouse_id, NEW.`product_id`, NEW.`batch_no`, NEW.`quantity`, NOW())
    ON DUPLICATE KEY UPDATE
      `quantity` = `inventory`.`quantity` + VALUES(`quantity`),
      `last_updated` = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_inbound_detail_ad_inventory`
AFTER DELETE ON `inbound_receipt_detail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT ir.`warehouse_id`, ir.`status`
    INTO v_warehouse_id, v_status
  FROM `inbound_receipt` ir
  WHERE ir.`receipt_id` = OLD.`receipt_id`;

  IF v_status = 'Completed' THEN
    IF fn_available_inventory(v_warehouse_id, OLD.`product_id`, OLD.`batch_no`) < OLD.`quantity` THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete inbound detail because inventory would become negative';
    END IF;

    UPDATE `inventory`
    SET `quantity` = `quantity` - OLD.`quantity`,
        `last_updated` = NOW()
    WHERE `warehouse_id` = v_warehouse_id
      AND `product_id` = OLD.`product_id`
      AND `batch_no` = OLD.`batch_no`;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_bi_validate`
BEFORE INSERT ON `outbound_issue_detail`
FOR EACH ROW
BEGIN
  SET NEW.`batch_no` = TRIM(NEW.`batch_no`);

  IF NEW.`batch_no` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound batch number is required';
  END IF;

  IF NEW.`quantity` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound quantity must be greater than zero';
  END IF;

  IF NEW.`selling_price` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound selling price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_bu_validate`
BEFORE UPDATE ON `outbound_issue_detail`
FOR EACH ROW
BEGIN
  SET NEW.`batch_no` = TRIM(NEW.`batch_no`);

  IF NEW.`batch_no` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound batch number is required';
  END IF;

  IF NEW.`quantity` <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound quantity must be greater than zero';
  END IF;

  IF NEW.`selling_price` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound selling price cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_outbound_issue_bu_check_inventory`
BEFORE UPDATE ON `outbound_issue`
FOR EACH ROW
BEGIN
  IF NEW.`status` = 'Completed'
     AND (OLD.`status` <> 'Completed' OR OLD.`warehouse_id` <> NEW.`warehouse_id`) THEN
    IF NOT EXISTS (
      SELECT 1 FROM `outbound_issue_detail` WHERE `issue_id` = NEW.`issue_id`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Outbound issue has no details';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM (
        SELECT d.`product_id`, d.`batch_no`, SUM(d.`quantity`) AS `requested_quantity`
        FROM `outbound_issue_detail` d
        WHERE d.`issue_id` = NEW.`issue_id`
        GROUP BY d.`product_id`, d.`batch_no`
      ) x
      LEFT JOIN `inventory` i
        ON i.`warehouse_id` = NEW.`warehouse_id`
       AND i.`product_id` = x.`product_id`
       AND i.`batch_no` = x.`batch_no`
      WHERE COALESCE(i.`quantity`, 0) < x.`requested_quantity`
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient inventory to complete outbound issue';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_issue_au_inventory`
AFTER UPDATE ON `outbound_issue`
FOR EACH ROW
BEGIN
  IF OLD.`status` = 'Completed'
     AND (NEW.`status` <> 'Completed' OR OLD.`warehouse_id` <> NEW.`warehouse_id`) THEN
    INSERT INTO `inventory` (`warehouse_id`, `product_id`, `batch_no`, `quantity`, `last_updated`)
    SELECT OLD.`warehouse_id`, d.`product_id`, d.`batch_no`, d.`quantity`, NOW()
    FROM `outbound_issue_detail` d
    WHERE d.`issue_id` = OLD.`issue_id`
    ON DUPLICATE KEY UPDATE
      `quantity` = `inventory`.`quantity` + VALUES(`quantity`),
      `last_updated` = NOW();
  END IF;

  IF NEW.`status` = 'Completed'
     AND (OLD.`status` <> 'Completed' OR OLD.`warehouse_id` <> NEW.`warehouse_id`) THEN
    UPDATE `inventory` i
    JOIN (
      SELECT d.`product_id`, d.`batch_no`, SUM(d.`quantity`) AS `requested_quantity`
      FROM `outbound_issue_detail` d
      WHERE d.`issue_id` = NEW.`issue_id`
      GROUP BY d.`product_id`, d.`batch_no`
    ) x
      ON x.`product_id` = i.`product_id`
     AND x.`batch_no` = i.`batch_no`
    SET i.`quantity` = i.`quantity` - x.`requested_quantity`,
        i.`last_updated` = NOW()
    WHERE i.`warehouse_id` = NEW.`warehouse_id`;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_bi_check_inventory`
BEFORE INSERT ON `outbound_issue_detail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT oi.`warehouse_id`, oi.`status`
    INTO v_warehouse_id, v_status
  FROM `outbound_issue` oi
  WHERE oi.`issue_id` = NEW.`issue_id`;

  IF v_status = 'Completed'
     AND fn_available_inventory(v_warehouse_id, NEW.`product_id`, TRIM(NEW.`batch_no`)) < NEW.`quantity` THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient inventory for outbound detail';
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_bu_check_inventory`
BEFORE UPDATE ON `outbound_issue_detail`
FOR EACH ROW
BEGIN
  DECLARE v_old_warehouse_id INT;
  DECLARE v_new_warehouse_id INT;
  DECLARE v_old_status VARCHAR(20);
  DECLARE v_new_status VARCHAR(20);
  DECLARE v_available INT DEFAULT 0;

  SELECT oi.`warehouse_id`, oi.`status`
    INTO v_old_warehouse_id, v_old_status
  FROM `outbound_issue` oi
  WHERE oi.`issue_id` = OLD.`issue_id`;

  SELECT oi.`warehouse_id`, oi.`status`
    INTO v_new_warehouse_id, v_new_status
  FROM `outbound_issue` oi
  WHERE oi.`issue_id` = NEW.`issue_id`;

  IF v_new_status = 'Completed' THEN
    SET v_available = fn_available_inventory(v_new_warehouse_id, NEW.`product_id`, TRIM(NEW.`batch_no`));

    IF v_old_status = 'Completed'
       AND v_old_warehouse_id = v_new_warehouse_id
       AND OLD.`product_id` = NEW.`product_id`
       AND OLD.`batch_no` = TRIM(NEW.`batch_no`) THEN
      SET v_available = v_available + OLD.`quantity`;
    END IF;

    IF v_available < NEW.`quantity` THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient inventory for outbound detail update';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_ai_inventory`
AFTER INSERT ON `outbound_issue_detail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT oi.`warehouse_id`, oi.`status`
    INTO v_warehouse_id, v_status
  FROM `outbound_issue` oi
  WHERE oi.`issue_id` = NEW.`issue_id`;

  IF v_status = 'Completed' THEN
    UPDATE `inventory`
    SET `quantity` = `quantity` - NEW.`quantity`,
        `last_updated` = NOW()
    WHERE `warehouse_id` = v_warehouse_id
      AND `product_id` = NEW.`product_id`
      AND `batch_no` = NEW.`batch_no`;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_au_inventory`
AFTER UPDATE ON `outbound_issue_detail`
FOR EACH ROW
BEGIN
  DECLARE v_old_warehouse_id INT;
  DECLARE v_new_warehouse_id INT;
  DECLARE v_old_status VARCHAR(20);
  DECLARE v_new_status VARCHAR(20);

  SELECT oi.`warehouse_id`, oi.`status`
    INTO v_old_warehouse_id, v_old_status
  FROM `outbound_issue` oi
  WHERE oi.`issue_id` = OLD.`issue_id`;

  SELECT oi.`warehouse_id`, oi.`status`
    INTO v_new_warehouse_id, v_new_status
  FROM `outbound_issue` oi
  WHERE oi.`issue_id` = NEW.`issue_id`;

  IF v_old_status = 'Completed' THEN
    INSERT INTO `inventory` (`warehouse_id`, `product_id`, `batch_no`, `quantity`, `last_updated`)
    VALUES (v_old_warehouse_id, OLD.`product_id`, OLD.`batch_no`, OLD.`quantity`, NOW())
    ON DUPLICATE KEY UPDATE
      `quantity` = `inventory`.`quantity` + VALUES(`quantity`),
      `last_updated` = NOW();
  END IF;

  IF v_new_status = 'Completed' THEN
    UPDATE `inventory`
    SET `quantity` = `quantity` - NEW.`quantity`,
        `last_updated` = NOW()
    WHERE `warehouse_id` = v_new_warehouse_id
      AND `product_id` = NEW.`product_id`
      AND `batch_no` = NEW.`batch_no`;
  END IF;
END$$

CREATE TRIGGER `trg_outbound_detail_ad_inventory`
AFTER DELETE ON `outbound_issue_detail`
FOR EACH ROW
BEGIN
  DECLARE v_warehouse_id INT;
  DECLARE v_status VARCHAR(20);

  SELECT oi.`warehouse_id`, oi.`status`
    INTO v_warehouse_id, v_status
  FROM `outbound_issue` oi
  WHERE oi.`issue_id` = OLD.`issue_id`;

  IF v_status = 'Completed' THEN
    INSERT INTO `inventory` (`warehouse_id`, `product_id`, `batch_no`, `quantity`, `last_updated`)
    VALUES (v_warehouse_id, OLD.`product_id`, OLD.`batch_no`, OLD.`quantity`, NOW())
    ON DUPLICATE KEY UPDATE
      `quantity` = `inventory`.`quantity` + VALUES(`quantity`),
      `last_updated` = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_inventory_bi_validate`
BEFORE INSERT ON `inventory`
FOR EACH ROW
BEGIN
  SET NEW.`batch_no` = TRIM(NEW.`batch_no`);

  IF NEW.`batch_no` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory batch number is required';
  END IF;

  IF NEW.`quantity` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory quantity cannot be negative';
  END IF;
END$$

CREATE TRIGGER `trg_inventory_bu_validate`
BEFORE UPDATE ON `inventory`
FOR EACH ROW
BEGIN
  SET NEW.`batch_no` = TRIM(NEW.`batch_no`);

  IF NEW.`batch_no` = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory batch number is required';
  END IF;

  IF NEW.`quantity` < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory quantity cannot be negative';
  END IF;
END$$

DELIMITER ;
