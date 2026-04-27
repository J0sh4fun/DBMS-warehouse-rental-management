package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.entity.LeaseContract;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import com.example.dbmswarehouserentalmanagement.exception.BusinessRuleViolationException;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.repository.LeaseContractRepository;
import com.example.dbmswarehouserentalmanagement.repository.WarehouseRepository;
import com.example.dbmswarehouserentalmanagement.service.LeaseContractExpirationService;
import com.example.dbmswarehouserentalmanagement.service.LeaseContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaseContractServiceImpl implements LeaseContractService {

    private static final List<LeaseContractStatus> BLOCKING_LEASE_STATUSES = List.of(
            LeaseContractStatus.Pending,
            LeaseContractStatus.Active
    );

    private final LeaseContractRepository leaseContractRepository;
    private final WarehouseRepository warehouseRepository;
    private final CustomerRepository customerRepository;
    private final LeaseContractExpirationService leaseContractExpirationService;

    @Override
    @Transactional
    public LeaseContractResponse create(Integer adminId, LeaseContractRequest request) {
        leaseContractExpirationService.expireOverdueContracts();
        validateDateRange(request);
        Warehouse warehouse = getOwnedWarehouse(adminId, request.warehouseId());
        LeaseContractStatus status = resolveStatusForEndDate(
                request.status() == null ? LeaseContractStatus.Pending : request.status(),
                request.endDate()
        );
        validateWarehouseForStatus(warehouse, status, "Cannot create a lease contract for an inactive warehouse");
        validateNoOverlappingLease(warehouse.getWarehouseId(), null, request, status);

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        LeaseContract contract = LeaseContract.builder()
                .customer(customer)
                .warehouse(warehouse)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .rentalPrice(request.rentalPrice())
                .status(status)
                .purpose(trimToNull(request.purpose()))
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(leaseContractRepository.save(contract));
    }

    @Override
    @Transactional
    public LeaseContractResponse update(Integer adminId, Integer contractId, LeaseContractRequest request) {
        leaseContractExpirationService.expireOverdueContracts();
        validateDateRange(request);
        LeaseContract contract = getOwnedContract(adminId, contractId);
        Warehouse warehouse = getOwnedWarehouse(adminId, request.warehouseId());
        LeaseContractStatus status = resolveStatusForEndDate(
                request.status() == null ? contract.getStatus() : request.status(),
                request.endDate()
        );
        validateWarehouseForStatus(warehouse, status, "Cannot move a lease contract to an inactive warehouse");
        validateNoOverlappingLease(warehouse.getWarehouseId(), contractId, request, status);

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        contract.setCustomer(customer);
        contract.setWarehouse(warehouse);
        contract.setStartDate(request.startDate());
        contract.setEndDate(request.endDate());
        contract.setRentalPrice(request.rentalPrice());
        contract.setStatus(status);
        contract.setPurpose(trimToNull(request.purpose()));
        return toResponse(contract);
    }

    @Override
    @Transactional
    public LeaseContractResponse updateStatus(Integer adminId, Integer contractId, LeaseContractStatus status) {
        leaseContractExpirationService.expireOverdueContracts();
        if (status == null) {
            throw new BusinessRuleViolationException("Status is required");
        }

        LeaseContract contract = getOwnedContract(adminId, contractId);
        if (isOverdue(contract.getEndDate()) && status != LeaseContractStatus.Expired) {
            contract.setStatus(LeaseContractStatus.Expired);
            throw new BusinessRuleViolationException("Expired lease contract cannot be changed to " + status);
        }
        validateWarehouseForStatus(contract.getWarehouse(), status, "Cannot update a lease contract for an inactive warehouse");
        contract.setStatus(status);
        return toResponse(contract);
    }

    @Override
    @Transactional
    public void delete(Integer adminId, Integer contractId) {
        leaseContractExpirationService.expireOverdueContracts();
        LeaseContract contract = getOwnedContract(adminId, contractId);
        leaseContractRepository.delete(contract);
        leaseContractRepository.flush();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaseContractResponse> findAll(Integer adminId, LeaseContractStatus status) {
        leaseContractExpirationService.expireOverdueContracts();
        return leaseContractRepository.findByAdminIdAndOptionalStatus(adminId, status).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaseContractResponse findById(Integer adminId, Integer contractId) {
        leaseContractExpirationService.expireOverdueContracts();
        return toResponse(getOwnedContract(adminId, contractId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaseContractResponse> findCurrentForCustomer(Integer customerId) {
        leaseContractExpirationService.expireOverdueContracts();
        return leaseContractRepository.findCurrentByCustomerId(
                        customerId,
                        LeaseContractStatus.Active,
                        java.time.LocalDate.now(),
                        WarehouseStatus.Inactive
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Warehouse getOwnedWarehouse(Integer adminId, Integer warehouseId) {
        return warehouseRepository.findByWarehouseIdAndAdminAdminId(warehouseId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));
    }

    private LeaseContract getOwnedContract(Integer adminId, Integer contractId) {
        return leaseContractRepository.findOwnedById(contractId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Lease contract not found"));
    }

    private void validateDateRange(LeaseContractRequest request) {
        if (request.startDate() == null || request.endDate() == null) {
            throw new BusinessRuleViolationException("Start date and end date are required");
        }
        if (!request.endDate().isAfter(request.startDate())) {
            throw new BusinessRuleViolationException("End date must be after start date");
        }
    }

    private void validateWarehouseForStatus(Warehouse warehouse, LeaseContractStatus status, String inactiveMessage) {
        if (warehouse.getStatus() == WarehouseStatus.Inactive) {
            throw new BusinessRuleViolationException(inactiveMessage);
        }
        if (status == LeaseContractStatus.Active && warehouse.getStatus() != WarehouseStatus.Active) {
            throw new BusinessRuleViolationException("Cannot activate contract for a warehouse that is not Active");
        }
    }

    private void validateNoOverlappingLease(
            Integer warehouseId,
            Integer currentContractId,
            LeaseContractRequest request,
            LeaseContractStatus status
    ) {
        if (!BLOCKING_LEASE_STATUSES.contains(status)) {
            return;
        }

        boolean overlaps = currentContractId == null
                ? leaseContractRepository.existsOverlappingLease(
                        warehouseId,
                        BLOCKING_LEASE_STATUSES,
                        request.startDate(),
                        request.endDate()
                )
                : leaseContractRepository.existsOverlappingLeaseExcludingContract(
                        warehouseId,
                        currentContractId,
                        BLOCKING_LEASE_STATUSES,
                        request.startDate(),
                        request.endDate()
                );
        if (overlaps) {
            throw new BusinessRuleViolationException("Warehouse is already reserved for the selected period");
        }
    }

    private LeaseContractStatus resolveStatusForEndDate(LeaseContractStatus status, java.time.LocalDate endDate) {
        if (isOverdue(endDate)) {
            return LeaseContractStatus.Expired;
        }
        return status;
    }

    private boolean isOverdue(java.time.LocalDate endDate) {
        return endDate != null && endDate.isBefore(java.time.LocalDate.now());
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private LeaseContractResponse toResponse(LeaseContract contract) {
        return new LeaseContractResponse(
                contract.getContractId(),
                contract.getCustomer().getCustomerId(),
                contract.getCustomer().getCustomerName(),
                contract.getWarehouse().getWarehouseId(),
                contract.getWarehouse().getWarehouseName(),
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getRentalPrice(),
                contract.getStatus(),
                contract.getPurpose(),
                contract.getCreatedAt()
        );
    }
}
