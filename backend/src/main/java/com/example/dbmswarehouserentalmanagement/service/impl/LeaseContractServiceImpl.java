package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;
import com.example.dbmswarehouserentalmanagement.entity.Admin;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.entity.LeaseContract;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import com.example.dbmswarehouserentalmanagement.exception.BusinessRuleViolationException;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.AdminRepository;
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
    private final AdminRepository adminRepository;

    @Override
    @Transactional
    public LeaseContractResponse createContract(LeaseContractRequest request, String currentIdentifier) {
        Admin admin = resolveCurrentAdmin(currentIdentifier);
        Customer customer = resolveCustomer(request.getCustomerId());
        Warehouse warehouse = resolveWarehouseOwnedByAdmin(request.getWarehouseId(), admin.getAdminId());

        validateDateRange(request);
        validateWarehouseStatusForActiveContract(request.getStatus(), warehouse.getStatus());

        LeaseContract contract = LeaseContract.builder()
                .customer(customer)
                .warehouse(warehouse)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .rentalPrice(request.getRentalPrice())
                .status(request.getStatus())
                .purpose(request.getPurpose())
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(leaseContractRepository.save(contract));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaseContractResponse> getContractsByCurrentAdmin(String currentIdentifier) {
        Integer adminId = resolveCurrentAdmin(currentIdentifier).getAdminId();
        return leaseContractRepository.findByWarehouse_Admin_AdminId(adminId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaseContractResponse getContractById(Integer contractId, String currentIdentifier) {
        Integer adminId = resolveCurrentAdmin(currentIdentifier).getAdminId();
        LeaseContract contract = leaseContractRepository.findByContractIdAndWarehouse_Admin_AdminId(contractId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Lease contract not found"));
        return toResponse(contract);
    }

    @Override
    @Transactional
    public LeaseContractResponse updateContract(Integer contractId, LeaseContractRequest request, String currentIdentifier) {
        Integer adminId = resolveCurrentAdmin(currentIdentifier).getAdminId();

        LeaseContract contract = leaseContractRepository.findByContractIdAndWarehouse_Admin_AdminId(contractId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Lease contract not found"));

        Customer customer = resolveCustomer(request.getCustomerId());
        Warehouse warehouse = resolveWarehouseOwnedByAdmin(request.getWarehouseId(), adminId);

        validateDateRange(request);
        validateWarehouseStatusForActiveContract(request.getStatus(), warehouse.getStatus());

        contract.setCustomer(customer);
        contract.setWarehouse(warehouse);
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setRentalPrice(request.getRentalPrice());
        contract.setStatus(request.getStatus());
        contract.setPurpose(request.getPurpose());

        return toResponse(leaseContractRepository.save(contract));
    }

    @Override
    @Transactional
    public void deleteContract(Integer contractId, String currentIdentifier) {
        Integer adminId = resolveCurrentAdmin(currentIdentifier).getAdminId();

        LeaseContract contract = leaseContractRepository.findByContractIdAndWarehouse_Admin_AdminId(contractId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Lease contract not found"));

        leaseContractRepository.delete(contract);
    }

    private Admin resolveCurrentAdmin(String currentIdentifier) {
        return adminRepository.findByUserNameOrEmail(currentIdentifier, currentIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
    }

    private Customer resolveCustomer(Integer customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private Warehouse resolveWarehouseOwnedByAdmin(Integer warehouseId, Integer adminId) {
        return warehouseRepository.findByWarehouseIdAndAdmin_AdminId(warehouseId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));
    }

    private void validateDateRange(LeaseContractRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessRuleViolationException("End date must be on or after start date");
        }
    }

    private void validateWarehouseStatusForActiveContract(LeaseContractStatus contractStatus, WarehouseStatus warehouseStatus) {
        if (contractStatus == LeaseContractStatus.Active
                && (warehouseStatus == WarehouseStatus.Inactive || warehouseStatus == WarehouseStatus.Maintenance)) {
            throw new BusinessRuleViolationException("Cannot activate contract for a warehouse that is not Active");
        }
    }

    private LeaseContractResponse toResponse(LeaseContract contract) {
        return LeaseContractResponse.builder()
                .contractId(contract.getContractId())
                .customerId(contract.getCustomer().getCustomerId())
                .warehouseId(contract.getWarehouse().getWarehouseId())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .rentalPrice(contract.getRentalPrice())
                .status(contract.getStatus())
                .purpose(contract.getPurpose())
                .createdAt(contract.getCreatedAt())
                .build();
    }
}

