package com.example.dbmswarehouserentalmanagement.dto.request;

import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseRequest {

    @NotBlank(message = "Warehouse name is required")
    @Size(max = 255, message = "Warehouse name must be at most 255 characters")
    private String warehouseName;

    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    @NotNull(message = "Area is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Area must be greater than 0")
    private Float area;

    @NotNull(message = "Status is required")
    private WarehouseStatus status;
}

