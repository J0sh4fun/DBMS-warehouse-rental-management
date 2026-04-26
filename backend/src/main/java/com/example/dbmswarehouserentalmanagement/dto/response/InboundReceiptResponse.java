package com.example.dbmswarehouserentalmanagement.dto.response;

import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;

import java.time.LocalDateTime;
import java.util.List;

public record InboundReceiptResponse(
        Integer receiptId,
        Integer warehouseId,
        String warehouseName,
        Integer supplierId,
        String supplierName,
        LocalDateTime receiptDate,
        ReceiptStatus status,
        LocalDateTime createdAt,
        List<InboundReceiptDetailResponse> details
) {
}
