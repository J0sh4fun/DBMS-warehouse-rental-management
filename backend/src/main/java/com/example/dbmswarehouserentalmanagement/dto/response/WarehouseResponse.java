package com.example.dbmswarehouserentalmanagement.dto.response;

import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;

import java.math.BigDecimal;

public record WarehouseResponse(
        Integer warehouseId,
        String warehouseName,
        String address,
        Float area,
        BigDecimal rentalPrice,
        WarehouseStatus status,
        Integer adminId,
        String adminName
) {
}
