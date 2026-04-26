package com.example.dbmswarehouserentalmanagement.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InboundReceiptDetailResponse(
        Integer productId,
        String productName,
        String batchNo,
        Integer quantity,
        BigDecimal importPrice,
        LocalDate expiryDate
) {
}
