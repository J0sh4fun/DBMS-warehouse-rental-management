package com.example.dbmswarehouserentalmanagement.dto.response;

import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
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
public class WarehouseResponse {

    private Integer warehouseId;

    private String warehouseName;

    private String address;

    private Float area;

    private WarehouseStatus status;

    private Integer adminId;
}

