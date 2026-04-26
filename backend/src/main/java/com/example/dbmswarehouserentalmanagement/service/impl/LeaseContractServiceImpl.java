package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.entity.LeaseContract;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.repository.LeaseContractRepository;
import com.example.dbmswarehouserentalmanagement.repository.WarehouseRepository;
import com.example.dbmswarehouserentalmanagement.service.LeaseContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaseContractServiceImpl implements LeaseContractService {

    private final LeaseContractRepository leaseContractRepository;
    private final WarehouseRepository warehouseRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public LeaseContractResponse create(Integer adminId, LeaseContractRequest request) {
        validateDateRange(request);
        Warehouse warehouse = getOwnedWarehouse(adminId, request.warehouseId());
        if (warehouse.getStatus() == WarehouseStatus.Inactive) {
            throw new IllegalStateException("Cannot create a lease contract for an inactive warehouse");
        }
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        LeaseContract contract = LeaseContract.builder()
                .customer(customer)
                .warehouse(warehouse)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .rentalPrice(request.rentalPrice())
                .status(request.status() == null ? LeaseContractStatus.Pending : request.status())
                .purpose(trimToNull(request.purpose()))
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(leaseContractRepository.save(contract));
    }

    @Override
    @Transactional
    public LeaseContractResponse update(Integer adminId, Integer contractId, LeaseContractRequest request) {
        validateDateRange(request);
        LeaseContract contract = getOwnedContract(adminId, contractId);
        Warehouse warehouse = getOwnedWarehouse(adminId, request.warehouseId());
        if (warehouse.getStatus() == WarehouseStatus.Inactive) {
            throw new IllegalStateException("Cannot move a lease contract to an inactive warehouse");
        }
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        contract.setCustomer(customer);
        contract.setWarehouse(warehouse);
        contract.setStartDate(request.startDate());
        contract.setEndDate(request.endDate());
        contract.setRentalPrice(request.rentalPrice());
        contract.setStatus(request.status() == null ? contract.getStatus() : request.status());
        contract.setPurpose(trimToNull(request.purpose()));
        return toResponse(contract);
    }

    @Override
    @Transactional
    public LeaseContractResponse updateStatus(Integer adminId, Integer contractId, LeaseContractStatus status) {
        LeaseContract contract = getOwnedContract(adminId, contractId);
        contract.setStatus(status);
        return toResponse(contract);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaseContractResponse> findAll(Integer adminId, LeaseContractStatus status) {
        return leaseContractRepository.findByAdminIdAndOptionalStatus(adminId, status).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaseContractResponse findById(Integer adminId, Integer contractId) {
        return toResponse(getOwnedContract(adminId, contractId));
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
        if (!request.endDate().isAfter(request.startDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }
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
