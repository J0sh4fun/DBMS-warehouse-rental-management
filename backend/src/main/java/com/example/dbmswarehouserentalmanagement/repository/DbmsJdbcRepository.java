package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.dto.response.AdminCustomerResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.ExpiringBatchResponse;
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

    public List<ExpiringBatchResponse> findExpiringBatches(Integer customerId, int daysAhead) {
        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("daysAhead", daysAhead);

        return namedParameterJdbcTemplate.query("""
                        select
                          ReceiptId,
                          WarehouseId,
                          WarehouseName,
                          SupplierId,
                          SupplierName,
                          ProductId,
                          ProductName,
                          BatchNo,
                          CurrentQuantity,
                          ExpiryDate
                        from vw_expiring_batches
                        where CustomerId = :customerId
                          and DaysUntilExpiry between 0 and :daysAhead
                        order by ExpiryDate asc, ProductName asc, BatchNo asc, ReceiptId asc
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
                          ProductId,
                          ProductName,
                          sum(TotalQuantityExported) as TotalQuantity
                        from vw_monthly_product_exports
                        where CustomerId = :customerId
                          and ExportYear = :year
                          and ExportMonth = :month
                        group by ProductId, ProductName
                        order by TotalQuantity desc, sum(TotalRevenue) desc
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
                          ProductId,
                          ProductName,
                          UnitOfMeasure,
                          sum(TotalQuantity) as TotalQuantity
                        from vw_inventory_summary
                        where CustomerId = :customerId
                          and (:warehouseId is null or WarehouseId = :warehouseId)
                          and (:productId is null or ProductId = :productId)
                        group by ProductId, ProductName, UnitOfMeasure
                        order by ProductName asc
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
                          c.CustomerId,
                          c.CustomerName,
                          c.UserName,
                          c.Email,
                          c.PhoneNumber,
                          c.Address,
                          c.CreatedAt
                        from Customer c
                        join vw_current_tenants t on t.CustomerId = c.CustomerId
                        where t.AdminId = ?
                        order by c.CustomerName asc
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
        return resultSet.getTimestamp("CreatedAt").toLocalDateTime();
    }

    @FunctionalInterface
    private interface CallableStatementBinder {
        void bind(CallableStatement statement) throws SQLException;
    }
}
