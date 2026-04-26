package com.example.dbmswarehouserentalmanagement.dto.response;

public record TopProductResponse(
        Integer productId,
        String productName,
        Long totalQuantity
) {
}
