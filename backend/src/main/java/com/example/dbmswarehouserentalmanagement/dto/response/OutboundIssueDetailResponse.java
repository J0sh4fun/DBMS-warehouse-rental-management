package com.example.dbmswarehouserentalmanagement.dto.response;

import java.math.BigDecimal;

public record OutboundIssueDetailResponse(
        Integer productId,
        String productName,
        String batchNo,
        Integer quantity,
        BigDecimal sellingPrice
) {
}
