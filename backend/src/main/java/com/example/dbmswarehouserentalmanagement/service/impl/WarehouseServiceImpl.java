package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseResponse;
import com.example.dbmswarehouserentalmanagement.entity.Admin;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.AdminRepository;
import com.example.dbmswarehouserentalmanagement.repository.WarehouseRepository;
import com.example.dbmswarehouserentalmanagement.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final AdminRepository adminRepository;

    @Override
    @Transactional
    public WarehouseResponse create(Integer adminId, WarehouseRequest request) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Warehouse warehouse = Warehouse.builder()
                .warehouseName(request.warehouseName().trim())
                .address(trimToNull(request.address()))
                .area(request.area())
                .status(request.status() == null ? WarehouseStatus.Active : request.status())
                .admin(admin)
                .build();

        return toResponse(warehouseRepository.save(warehouse));
    }

    @Override
    @Transactional
    public WarehouseResponse update(Integer adminId, Integer warehouseId, WarehouseRequest request) {
        Warehouse warehouse = getOwnedWarehouse(adminId, warehouseId);
        warehouse.setWarehouseName(request.warehouseName().trim());
        warehouse.setAddress(trimToNull(request.address()));
        warehouse.setArea(request.area());
        warehouse.setStatus(request.status() == null ? warehouse.getStatus() : request.status());
        return toResponse(warehouse);
    }

    @Override
    @Transactional
    public WarehouseResponse deactivate(Integer adminId, Integer warehouseId) {
        Warehouse warehouse = getOwnedWarehouse(adminId, warehouseId);
        warehouse.setStatus(WarehouseStatus.Inactive);
        return toResponse(warehouse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseResponse> findAll(Integer adminId) {
        return warehouseRepository.findByAdminAdminIdOrderByWarehouseIdDesc(adminId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse findById(Integer adminId, Integer warehouseId) {
        return toResponse(getOwnedWarehouse(adminId, warehouseId));
    }

    private Warehouse getOwnedWarehouse(Integer adminId, Integer warehouseId) {
        return warehouseRepository.findByWarehouseIdAndAdminAdminId(warehouseId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private WarehouseResponse toResponse(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getWarehouseId(),
                warehouse.getWarehouseName(),
                warehouse.getAddress(),
                warehouse.getArea(),
                warehouse.getStatus(),
                warehouse.getAdmin().getAdminId(),
                warehouse.getAdmin().getAdminName()
        );
    }
}
