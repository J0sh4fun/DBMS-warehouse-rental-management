package com.example.dbmswarehouserentalmanagement.dto.response;

public record InventorySummaryResponse(
        Integer productId,
        String productName,
        String unitOfMeasure,
        Long totalQuantity
) {
}
