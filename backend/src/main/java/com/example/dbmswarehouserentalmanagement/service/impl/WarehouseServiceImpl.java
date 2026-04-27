package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseResponse;
import com.example.dbmswarehouserentalmanagement.entity.Admin;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import com.example.dbmswarehouserentalmanagement.exception.BusinessRuleViolationException;
import com.example.dbmswarehouserentalmanagement.exception.ResourceConflictException;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.AdminRepository;
import com.example.dbmswarehouserentalmanagement.repository.InboundReceiptRepository;
import com.example.dbmswarehouserentalmanagement.repository.InventoryRepository;
import com.example.dbmswarehouserentalmanagement.repository.LeaseContractRepository;
import com.example.dbmswarehouserentalmanagement.repository.OutboundIssueRepository;
import com.example.dbmswarehouserentalmanagement.repository.WarehouseRepository;
import com.example.dbmswarehouserentalmanagement.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private static final List<LeaseContractStatus> BLOCKING_LEASE_STATUSES = List.of(
            LeaseContractStatus.Pending,
            LeaseContractStatus.Active
    );

    private final WarehouseRepository warehouseRepository;
    private final AdminRepository adminRepository;
    private final LeaseContractRepository leaseContractRepository;
    private final InboundReceiptRepository inboundReceiptRepository;
    private final OutboundIssueRepository outboundIssueRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public WarehouseResponse create(Integer adminId, WarehouseRequest request) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Warehouse warehouse = Warehouse.builder()
                .warehouseName(request.warehouseName().trim())
                .address(trimToNull(request.address()))
                .area(request.area())
                .rentalPrice(request.rentalPrice())
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
        warehouse.setRentalPrice(request.rentalPrice());
        warehouse.setStatus(request.status() == null ? warehouse.getStatus() : request.status());
        return toResponse(warehouse);
    }

    @Override
    @Transactional
    public void delete(Integer adminId, Integer warehouseId) {
        Warehouse warehouse = getOwnedWarehouse(adminId, warehouseId);
        ensureWarehouseCanBeDeleted(warehouseId);
        warehouseRepository.delete(warehouse);
        warehouseRepository.flush();
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
    public List<WarehouseResponse> findAvailableForCustomers(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        return warehouseRepository.findAvailableForRental(WarehouseStatus.Active, BLOCKING_LEASE_STATUSES, startDate, endDate).stream()
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

    private void ensureWarehouseCanBeDeleted(Integer warehouseId) {
        if (leaseContractRepository.existsByWarehouseWarehouseId(warehouseId)) {
            throw new ResourceConflictException("Warehouse cannot be deleted because it has lease contracts");
        }
        if (inboundReceiptRepository.existsByWarehouseWarehouseId(warehouseId)) {
            throw new ResourceConflictException("Warehouse cannot be deleted because it has inbound receipts");
        }
        if (outboundIssueRepository.existsByWarehouseWarehouseId(warehouseId)) {
            throw new ResourceConflictException("Warehouse cannot be deleted because it has outbound issues");
        }
        if (inventoryRepository.existsByWarehouseId(warehouseId)) {
            throw new ResourceConflictException("Warehouse cannot be deleted because it has inventory records");
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BusinessRuleViolationException("Start date and end date are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new BusinessRuleViolationException("End date must be on or after start date");
        }
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
                warehouse.getRentalPrice(),
                warehouse.getStatus(),
                warehouse.getAdmin().getAdminId(),
                warehouse.getAdmin().getAdminName()
        );
    }
}
