package com.example.dbmswarehouserentalmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record WarehouseRentalRequestCreateRequest(
        @NotNull(message = "Warehouse ID is required")
        Integer warehouseId,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @Size(max = 255, message = "Purpose must be at most 255 characters")
        String purpose
) {
}
