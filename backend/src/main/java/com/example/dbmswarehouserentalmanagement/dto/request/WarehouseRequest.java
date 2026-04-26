package com.example.dbmswarehouserentalmanagement.dto.request;

import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WarehouseRequest(
        @NotBlank(message = "Warehouse name is required")
        @Size(max = 255, message = "Warehouse name must be at most 255 characters")
        String warehouseName,

        @Size(max = 255, message = "Address must be at most 255 characters")
        String address,

        @DecimalMin(value = "0.0", inclusive = false, message = "Area must be greater than 0")
        Float area,

        WarehouseStatus status
) {
}
