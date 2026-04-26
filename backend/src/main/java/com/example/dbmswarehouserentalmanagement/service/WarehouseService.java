package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseResponse;

import java.util.List;

public interface WarehouseService {

    WarehouseResponse createWarehouse(WarehouseRequest request, String currentIdentifier);

    List<WarehouseResponse> getWarehousesByCurrentAdmin(String currentIdentifier);

    WarehouseResponse getWarehouseById(Integer warehouseId, String currentIdentifier);

    WarehouseResponse updateWarehouse(Integer warehouseId, WarehouseRequest request, String currentIdentifier);

    void deleteWarehouse(Integer warehouseId, String currentIdentifier);
}

