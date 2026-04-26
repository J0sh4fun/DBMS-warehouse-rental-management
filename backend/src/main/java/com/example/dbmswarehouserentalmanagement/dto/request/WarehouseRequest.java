package com.example.dbmswarehouserentalmanagement.dto.request;

import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public record WarehouseRequest(
        @NotBlank(message = "Warehouse name is required")
        String warehouseName,

        String address,

        @DecimalMin(value = "0.0", inclusive = false, message = "Area must be greater than zero")
        Float area,

        WarehouseStatus status
) {
}
