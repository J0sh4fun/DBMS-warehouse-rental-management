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
        executeProcedure("{call procedure_hoan_tat_phieu_nhap(?)}", statement -> statement.setInt(1, receiptId));
    }

    public void completeOutboundIssue(Integer issueId) {
        executeProcedure("{call procedure_hoan_tat_phieu_xuat(?)}", statement -> statement.setInt(1, issueId));
    }

    public int expireOverdueContracts() {
        return jdbcTemplate.execute((ConnectionCallback<Integer>) connection -> {
            try (CallableStatement statement = connection.prepareCall("{call procedure_cap_nhat_hop_dong_thue_het_han()}")) {
                boolean hasResults = statement.execute();
                Integer soHopDongHetHan = null;

                while (true) {
                    if (hasResults) {
                        try (ResultSet resultSet = statement.getResultSet()) {
                            while (resultSet.next()) {
                                soHopDongHetHan = resultSet.getInt("so_hop_dong_het_han");
                            }
                        }
                    } else if (statement.getUpdateCount() == -1) {
                        break;
                    }
                    hasResults = statement.getMoreResults();
                }

                return soHopDongHetHan == null ? 0 : soHopDongHetHan;
            }
        });
    }

    public BigDecimal findCustomerInventoryValue(Integer customerId) {
        BigDecimal tongGiaTri = jdbcTemplate.queryForObject(
                "select function_gia_tri_ton_kho_cua_khach_hang(?) as tong_gia_tri",
                (resultSet, rowNum) -> resultSet.getBigDecimal("tong_gia_tri"),
                customerId
        );
        return tongGiaTri == null ? BigDecimal.ZERO : tongGiaTri;
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
                          i.ma_kho as ma_kho,
                          w.ten_kho as ten_kho,
                          i.ma_san_pham as ma_san_pham,
                          p.ten_san_pham as ten_san_pham,
                          p.don_vi_tinh as don_vi_tinh,
                          i.so_lo as so_lo,
                          i.so_luong as so_luong,
                          coalesce(function_gia_tri_ton_kho_theo_lo(i.ma_kho, i.ma_san_pham, i.so_lo), 0) as gia_tri_lo,
                          i.cap_nhat_luc as cap_nhat_luc
                        from ton_kho i
                        join san_pham p on p.ma_san_pham = i.ma_san_pham
                        join kho w on w.ma_kho = i.ma_kho
                        where p.ma_khach_hang = :customerId
                          and p.da_xoa = false
                          and (:warehouseId is null or i.ma_kho = :warehouseId)
                          and (:productId is null or i.ma_san_pham = :productId)
                          and (:batchNo is null or i.so_lo = :batchNo)
                        order by p.ten_san_pham asc, i.so_lo asc
                        """,
                parameters,
                (resultSet, rowNum) -> new InventoryResponse(
                        resultSet.getInt("ma_kho"),
                        resultSet.getString("ten_kho"),
                        resultSet.getInt("ma_san_pham"),
                        resultSet.getString("ten_san_pham"),
                        resultSet.getString("don_vi_tinh"),
                        resultSet.getString("so_lo"),
                        resultSet.getInt("so_luong"),
                        resultSet.getBigDecimal("gia_tri_lo"),
                        toLocalDateTime(resultSet, "cap_nhat_luc")
                ));
    }

    public List<ExpiringBatchResponse> findExpiringBatches(Integer customerId, int daysAhead) {
        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("daysAhead", daysAhead);

        return namedParameterJdbcTemplate.query("""
                        select
                          ma_phieu_nhap as ma_phieu_nhap,
                          ma_kho as ma_kho,
                          ten_kho as ten_kho,
                          ma_nha_cung_cap as ma_nha_cung_cap,
                          ten_nha_cung_cap as ten_nha_cung_cap,
                          ma_san_pham as ma_san_pham,
                          ten_san_pham as ten_san_pham,
                          so_lo as so_lo,
                          so_luong_hien_tai as so_luong_hien_tai,
                          han_su_dung as han_su_dung
                        from view_lo_hang_sap_het_han
                        where ma_khach_hang = :customerId
                          and so_ngay_con_lai between 0 and :daysAhead
                        order by han_su_dung asc, ten_san_pham asc, so_lo asc, ma_phieu_nhap asc
                        """,
                parameters,
                (resultSet, rowNum) -> new ExpiringBatchResponse(
                        resultSet.getInt("ma_phieu_nhap"),
                        resultSet.getInt("ma_kho"),
                        resultSet.getString("ten_kho"),
                        resultSet.getInt("ma_nha_cung_cap"),
                        resultSet.getString("ten_nha_cung_cap"),
                        resultSet.getInt("ma_san_pham"),
                        resultSet.getString("ten_san_pham"),
                        resultSet.getString("so_lo"),
                        resultSet.getInt("so_luong_hien_tai"),
                        resultSet.getObject("han_su_dung", java.time.LocalDate.class)
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
                          ma_san_pham as ma_san_pham,
                          ten_san_pham as ten_san_pham,
                          sum(tong_so_luong_xuat) as tong_so_luong
                        from view_xuat_hang_theo_thang
                        where ma_khach_hang = :customerId
                          and nam_xuat = :year
                          and thang_xuat = :month
                        group by ma_san_pham, ten_san_pham
                        order by tong_so_luong desc, sum(tong_doanh_thu) desc
                        limit :limit
                        """,
                parameters,
                (resultSet, rowNum) -> new TopProductResponse(
                        resultSet.getInt("ma_san_pham"),
                        resultSet.getString("ten_san_pham"),
                        resultSet.getLong("tong_so_luong")
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
                          ma_san_pham as ma_san_pham,
                          ten_san_pham as ten_san_pham,
                          don_vi_tinh as don_vi_tinh,
                          sum(tong_so_luong) as tong_so_luong
                        from view_tong_hop_ton_kho
                        where ma_khach_hang = :customerId
                          and (:warehouseId is null or ma_kho = :warehouseId)
                          and (:productId is null or ma_san_pham = :productId)
                        group by ma_san_pham, ten_san_pham, don_vi_tinh
                        order by ten_san_pham asc
                        """,
                parameters,
                (resultSet, rowNum) -> new InventorySummaryResponse(
                        resultSet.getInt("ma_san_pham"),
                        resultSet.getString("ten_san_pham"),
                        resultSet.getString("don_vi_tinh"),
                        resultSet.getLong("tong_so_luong")
                ));
    }

    public List<AdminCustomerResponse> findCurrentTenants(Integer adminId) {
        return jdbcTemplate.query("""
                        select distinct
                          t.ma_khach_hang as ma_khach_hang,
                          t.ten_khach_hang as ten_khach_hang,
                          t.ten_dang_nhap_khach_hang as ten_dang_nhap,
                          t.email_khach_hang as email,
                          t.so_dien_thoai as so_dien_thoai,
                          c.dia_chi as dia_chi,
                          c.tao_luc as tao_luc
                        from view_khach_thue_hien_tai t
                        join khach_hang c on c.ma_khach_hang = t.ma_khach_hang
                        where t.ma_quan_tri_vien = ?
                        order by t.ten_khach_hang asc
                        """,
                (resultSet, rowNum) -> new AdminCustomerResponse(
                        resultSet.getInt("ma_khach_hang"),
                        resultSet.getString("ten_khach_hang"),
                        resultSet.getString("ten_dang_nhap"),
                        resultSet.getString("email"),
                        resultSet.getString("so_dien_thoai"),
                        resultSet.getString("dia_chi"),
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
        return toLocalDateTime(resultSet, "tao_luc");
    }

    private LocalDateTime toLocalDateTime(ResultSet resultSet, String columnName) throws SQLException {
        return resultSet.getTimestamp(columnName).toLocalDateTime();
    }

    @FunctionalInterface
    private interface CallableStatementBinder {
        void bind(CallableStatement statement) throws SQLException;
    }
}



