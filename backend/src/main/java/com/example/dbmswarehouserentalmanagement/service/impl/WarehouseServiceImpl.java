package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseResponse;
import com.example.dbmswarehouserentalmanagement.entity.Admin;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
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
    public WarehouseResponse createWarehouse(WarehouseRequest request, String currentIdentifier) {
        Admin admin = resolveCurrentAdmin(currentIdentifier);

        Warehouse warehouse = Warehouse.builder()
                .warehouseName(request.getWarehouseName().trim())
                .address(request.getAddress())
                .area(request.getArea())
                .status(request.getStatus())
                .admin(admin)
                .build();

        return toResponse(warehouseRepository.save(warehouse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseResponse> getWarehousesByCurrentAdmin(String currentIdentifier) {
        Integer adminId = resolveCurrentAdmin(currentIdentifier).getAdminId();
        return warehouseRepository.findByAdmin_AdminId(adminId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getWarehouseById(Integer warehouseId, String currentIdentifier) {
        Integer adminId = resolveCurrentAdmin(currentIdentifier).getAdminId();
        Warehouse warehouse = warehouseRepository.findByWarehouseIdAndAdmin_AdminId(warehouseId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));
        return toResponse(warehouse);
    }

    @Override
    @Transactional
    public WarehouseResponse updateWarehouse(Integer warehouseId, WarehouseRequest request, String currentIdentifier) {
        Integer adminId = resolveCurrentAdmin(currentIdentifier).getAdminId();

        Warehouse warehouse = warehouseRepository.findByWarehouseIdAndAdmin_AdminId(warehouseId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));

        warehouse.setWarehouseName(request.getWarehouseName().trim());
        warehouse.setAddress(request.getAddress());
        warehouse.setArea(request.getArea());
        warehouse.setStatus(request.getStatus());

        return toResponse(warehouseRepository.save(warehouse));
    }

    @Override
    @Transactional
    public void deleteWarehouse(Integer warehouseId, String currentIdentifier) {
        Integer adminId = resolveCurrentAdmin(currentIdentifier).getAdminId();

        Warehouse warehouse = warehouseRepository.findByWarehouseIdAndAdmin_AdminId(warehouseId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));

        warehouseRepository.delete(warehouse);
    }

    private Admin resolveCurrentAdmin(String currentIdentifier) {
        return adminRepository.findByUserNameOrEmail(currentIdentifier, currentIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
    }

    private WarehouseResponse toResponse(Warehouse warehouse) {
        return WarehouseResponse.builder()
                .warehouseId(warehouse.getWarehouseId())
                .warehouseName(warehouse.getWarehouseName())
                .address(warehouse.getAddress())
                .area(warehouse.getArea())
                .status(warehouse.getStatus())
                .adminId(warehouse.getAdmin().getAdminId())
                .build();
    }
}

