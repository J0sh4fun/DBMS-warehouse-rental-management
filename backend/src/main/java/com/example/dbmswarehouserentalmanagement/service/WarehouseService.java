package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseResponse;

import java.util.List;

public interface WarehouseService {

    WarehouseResponse create(Integer adminId, WarehouseRequest request);

    WarehouseResponse update(Integer adminId, Integer warehouseId, WarehouseRequest request);

    void delete(Integer adminId, Integer warehouseId);

    List<WarehouseResponse> findAll(Integer adminId);

    WarehouseResponse findById(Integer adminId, Integer warehouseId);
}
