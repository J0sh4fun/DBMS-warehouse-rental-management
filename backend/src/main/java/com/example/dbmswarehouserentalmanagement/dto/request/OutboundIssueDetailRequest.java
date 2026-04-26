package com.example.dbmswarehouserentalmanagement.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record OutboundIssueDetailRequest(
        @NotNull(message = "Product ID is required")
        Integer productId,

        @NotBlank(message = "Batch number is required")
        String batchNo,

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than zero")
        Integer quantity,

        @NotNull(message = "Selling price is required")
        @DecimalMin(value = "0.00", inclusive = true, message = "Selling price must be non-negative")
        BigDecimal sellingPrice
) {
}
