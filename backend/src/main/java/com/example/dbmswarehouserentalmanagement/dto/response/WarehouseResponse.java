package com.example.dbmswarehouserentalmanagement.dto.response;

import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;

public record WarehouseResponse(
        Integer warehouseId,
        String warehouseName,
        String address,
        Float area,
        WarehouseStatus status,
        Integer adminId,
        String adminName
) {
}
