package com.example.dbmswarehouserentalmanagement.dto.response;

import java.time.LocalDate;

public record ExpiringBatchResponse(
        Integer receiptId,
        Integer warehouseId,
        String warehouseName,
        Integer supplierId,
        String supplierName,
        Integer productId,
        String productName,
        String batchNo,
        Integer currentQuantity,
        LocalDate expiryDate
) {
}
