package com.example.dbmswarehouserentalmanagement.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryResponse(
        Integer warehouseId,
        String warehouseName,
        Integer productId,
        String productName,
        String unitOfMeasure,
        String batchNo,
        Integer quantity,
        BigDecimal batchValue,
        LocalDateTime lastUpdated
) {
}
