package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.response.ExpiringBatchResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventoryValueResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.TopProductResponse;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

public interface ReportService {

    InventoryValueResponse getInventoryValue(Integer customerId);

    List<ExpiringBatchResponse> findExpiringBatches(Integer customerId, LocalDate expiresOnOrBefore);

    List<TopProductResponse> findTopProducts(Integer customerId, YearMonth month, int limit);
}
