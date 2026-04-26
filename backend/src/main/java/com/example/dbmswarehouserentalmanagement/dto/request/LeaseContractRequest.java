package com.example.dbmswarehouserentalmanagement.dto.request;

import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LeaseContractRequest(
        @NotNull(message = "Customer ID is required")
        Integer customerId,

        @NotNull(message = "Warehouse ID is required")
        Integer warehouseId,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotNull(message = "Rental price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Rental price must be greater than 0")
        BigDecimal rentalPrice,

        LeaseContractStatus status,

        @Size(max = 255, message = "Purpose must be at most 255 characters")
        String purpose
) {
}
