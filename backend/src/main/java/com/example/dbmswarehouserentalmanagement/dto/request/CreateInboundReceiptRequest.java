package com.example.dbmswarehouserentalmanagement.dto.request;

import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record CreateInboundReceiptRequest(
        @NotNull(message = "Warehouse ID is required")
        Integer warehouseId,

        @NotNull(message = "Supplier ID is required")
        Integer supplierId,

        LocalDateTime receiptDate,

        ReceiptStatus status,

        @NotEmpty(message = "Receipt details are required")
        List<@Valid InboundReceiptDetailRequest> details
) {
}
