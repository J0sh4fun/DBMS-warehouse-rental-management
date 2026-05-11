package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.dto.response.AdminCustomerResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.ExpiringBatchResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventoryResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventorySummaryResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.TopProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class DbmsJdbcRepository {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public void completeInboundReceipt(Integer receiptId) {
        executeProcedure("{call sp_complete_inbound_receipt(?)}", statement -> statement.setInt(1, receiptId));
    }

    public void completeOutboundIssue(Integer issueId) {
        executeProcedure("{call sp_complete_outbound_issue(?)}", statement -> statement.setInt(1, issueId));
    }

    public int expireOverdueContracts() {
        return jdbcTemplate.execute((ConnectionCallback<Integer>) connection -> {
            try (CallableStatement statement = connection.prepareCall("{call sp_expire_lease_contracts()}")) {
                boolean hasResults = statement.execute();
                Integer expiredContracts = null;

                while (true) {
                    if (hasResults) {
                        try (ResultSet resultSet = statement.getResultSet()) {
                            while (resultSet.next()) {
                                expiredContracts = resultSet.getInt("expired_contracts");
                            }
                        }
                    } else if (statement.getUpdateCount() == -1) {
                        break;
                    }
                    hasResults = statement.getMoreResults();
                }

                return expiredContracts == null ? 0 : expiredContracts;
            }
        });
    }

    public BigDecimal findCustomerInventoryValue(Integer customerId) {
        BigDecimal totalValue = jdbcTemplate.queryForObject(
                "select fn_customer_inventory_value(?) as total_value",
                (resultSet, rowNum) -> resultSet.getBigDecimal("total_value"),
                customerId
        );
        return totalValue == null ? BigDecimal.ZERO : totalValue;
    }

    public List<InventoryResponse> findInventory(
            Integer customerId,
            Integer warehouseId,
            Integer productId,
            String batchNo
    ) {
        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("warehouseId", warehouseId)
                .addValue("productId", productId)
                .addValue("batchNo", batchNo);

        return namedParameterJdbcTemplate.query("""
                        select
                          i.warehouse_id as WarehouseId,
                          w.warehouse_name as WarehouseName,
                          i.product_id as ProductId,
                          p.product_name as ProductName,
                          p.unit_of_measure as UnitOfMeasure,
                          i.batch_no as BatchNo,
                          i.quantity as Quantity,
                          coalesce(fn_inventory_batch_value(i.warehouse_id, i.product_id, i.batch_no), 0) as BatchValue,
                          i.last_updated as LastUpdated
                        from inventory i
                        join product p on p.product_id = i.product_id
                        join warehouse w on w.warehouse_id = i.warehouse_id
                        where p.customer_id = :customerId
                          and p.is_deleted = false
                          and (:warehouseId is null or i.warehouse_id = :warehouseId)
                          and (:productId is null or i.product_id = :productId)
                          and (:batchNo is null or i.batch_no = :batchNo)
                        order by p.product_name asc, i.batch_no asc
                        """,
                parameters,
                (resultSet, rowNum) -> new InventoryResponse(
                        resultSet.getInt("WarehouseId"),
                        resultSet.getString("WarehouseName"),
                        resultSet.getInt("ProductId"),
                        resultSet.getString("ProductName"),
                        resultSet.getString("UnitOfMeasure"),
                        resultSet.getString("BatchNo"),
                        resultSet.getInt("Quantity"),
                        resultSet.getBigDecimal("BatchValue"),
                        toLocalDateTime(resultSet, "LastUpdated")
                ));
    }

    public List<ExpiringBatchResponse> findExpiringBatches(Integer customerId, int daysAhead) {
        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("daysAhead", daysAhead);

        return namedParameterJdbcTemplate.query("""
                        select
                          receipt_id as ReceiptId,
                          warehouse_id as WarehouseId,
                          warehouse_name as WarehouseName,
                          supplier_id as SupplierId,
                          supplier_name as SupplierName,
                          product_id as ProductId,
                          product_name as ProductName,
                          batch_no as BatchNo,
                          current_quantity as CurrentQuantity,
                          expiry_date as ExpiryDate
                        from vw_expiring_batches
                        where customer_id = :customerId
                          and days_until_expiry between 0 and :daysAhead
                        order by expiry_date asc, product_name asc, batch_no asc, receipt_id asc
                        """,
                parameters,
                (resultSet, rowNum) -> new ExpiringBatchResponse(
                        resultSet.getInt("ReceiptId"),
                        resultSet.getInt("WarehouseId"),
                        resultSet.getString("WarehouseName"),
                        resultSet.getInt("SupplierId"),
                        resultSet.getString("SupplierName"),
                        resultSet.getInt("ProductId"),
                        resultSet.getString("ProductName"),
                        resultSet.getString("BatchNo"),
                        resultSet.getInt("CurrentQuantity"),
                        resultSet.getObject("ExpiryDate", java.time.LocalDate.class)
                ));
    }

    public List<TopProductResponse> findTopProducts(Integer customerId, int year, int month, int limit) {
        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("year", year)
                .addValue("month", month)
                .addValue("limit", limit);

        return namedParameterJdbcTemplate.query("""
                        select
                          product_id as ProductId,
                          product_name as ProductName,
                          sum(total_quantity_exported) as TotalQuantity
                        from vw_monthly_product_exports
                        where customer_id = :customerId
                          and export_year = :year
                          and export_month = :month
                        group by product_id, product_name
                        order by TotalQuantity desc, sum(total_revenue) desc
                        limit :limit
                        """,
                parameters,
                (resultSet, rowNum) -> new TopProductResponse(
                        resultSet.getInt("ProductId"),
                        resultSet.getString("ProductName"),
                        resultSet.getLong("TotalQuantity")
                ));
    }

    public List<InventorySummaryResponse> findInventorySummary(
            Integer customerId,
            Integer warehouseId,
            Integer productId
    ) {
        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("warehouseId", warehouseId)
                .addValue("productId", productId);

        return namedParameterJdbcTemplate.query("""
                        select
                          product_id as ProductId,
                          product_name as ProductName,
                          unit_of_measure as UnitOfMeasure,
                          sum(total_quantity) as TotalQuantity
                        from vw_inventory_summary
                        where customer_id = :customerId
                          and (:warehouseId is null or warehouse_id = :warehouseId)
                          and (:productId is null or product_id = :productId)
                        group by product_id, product_name, unit_of_measure
                        order by product_name asc
                        """,
                parameters,
                (resultSet, rowNum) -> new InventorySummaryResponse(
                        resultSet.getInt("ProductId"),
                        resultSet.getString("ProductName"),
                        resultSet.getString("UnitOfMeasure"),
                        resultSet.getLong("TotalQuantity")
                ));
    }

    public List<AdminCustomerResponse> findCurrentTenants(Integer adminId) {
        return jdbcTemplate.query("""
                        select distinct
                          t.customer_id as CustomerId,
                          t.customer_name as CustomerName,
                          t.customer_user_name as UserName,
                          t.customer_email as Email,
                          t.phone_number as PhoneNumber,
                          c.address as Address,
                          c.created_at as CreatedAt
                        from vw_current_tenants t
                        join customer c on c.customer_id = t.customer_id
                        where t.admin_id = ?
                        order by t.customer_name asc
                        """,
                (resultSet, rowNum) -> new AdminCustomerResponse(
                        resultSet.getInt("CustomerId"),
                        resultSet.getString("CustomerName"),
                        resultSet.getString("UserName"),
                        resultSet.getString("Email"),
                        resultSet.getString("PhoneNumber"),
                        resultSet.getString("Address"),
                        toLocalDateTime(resultSet)
                ),
                adminId
        );
    }

    private void executeProcedure(String callSql, CallableStatementBinder binder) {
        jdbcTemplate.execute((ConnectionCallback<Void>) connection -> {
            try (CallableStatement statement = connection.prepareCall(callSql)) {
                binder.bind(statement);
                drainProcedureResults(statement);
                return null;
            }
        });
    }

    private void drainProcedureResults(CallableStatement statement) throws SQLException {
        boolean hasResults = statement.execute();

        while (true) {
            if (hasResults) {
                try (ResultSet resultSet = statement.getResultSet()) {
                    while (resultSet.next()) {
                        // Consume result sets so MySQL can finish the call cleanly.
                    }
                }
            } else if (statement.getUpdateCount() == -1) {
                break;
            }
            hasResults = statement.getMoreResults();
        }
    }

    private LocalDateTime toLocalDateTime(ResultSet resultSet) throws SQLException {
        return toLocalDateTime(resultSet, "CreatedAt");
    }

    private LocalDateTime toLocalDateTime(ResultSet resultSet, String columnName) throws SQLException {
        return resultSet.getTimestamp(columnName).toLocalDateTime();
    }

    @FunctionalInterface
    private interface CallableStatementBinder {
        void bind(CallableStatement statement) throws SQLException;
    }
}
