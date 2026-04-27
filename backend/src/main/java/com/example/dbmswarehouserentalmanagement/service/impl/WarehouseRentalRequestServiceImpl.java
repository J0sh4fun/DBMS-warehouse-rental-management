package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractRequest;
import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRentalRequestCreateRequest;
import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRentalRequestReviewRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseRentalRequestResponse;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.entity.LeaseContract;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.WarehouseRentalRequest;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.RentalRequestStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import com.example.dbmswarehouserentalmanagement.exception.BusinessRuleViolationException;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.repository.LeaseContractRepository;
import com.example.dbmswarehouserentalmanagement.repository.WarehouseRentalRequestRepository;
import com.example.dbmswarehouserentalmanagement.repository.WarehouseRepository;
import com.example.dbmswarehouserentalmanagement.service.LeaseContractService;
import com.example.dbmswarehouserentalmanagement.service.WarehouseRentalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseRentalRequestServiceImpl implements WarehouseRentalRequestService {

    private static final List<LeaseContractStatus> BLOCKING_LEASE_STATUSES = List.of(
            LeaseContractStatus.Pending,
            LeaseContractStatus.Active
    );

    private final WarehouseRentalRequestRepository rentalRequestRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final LeaseContractRepository leaseContractRepository;
    private final LeaseContractService leaseContractService;

    @Override
    @Transactional
    public WarehouseRentalRequestResponse create(Integer customerId, WarehouseRentalRequestCreateRequest request) {
        validateDateRange(request.startDate(), request.endDate());

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));
        if (warehouse.getStatus() != WarehouseStatus.Active) {
            throw new BusinessRuleViolationException("Only active warehouses can be requested");
        }
        if (warehouse.getRentalPrice() == null || warehouse.getRentalPrice().signum() <= 0) {
            throw new BusinessRuleViolationException("Warehouse rental price is not configured");
        }
        if (leaseContractRepository.existsOverlappingLease(warehouse.getWarehouseId(), BLOCKING_LEASE_STATUSES, request.startDate(), request.endDate())) {
            throw new BusinessRuleViolationException("Warehouse is already reserved for the selected period");
        }

        WarehouseRentalRequest rentalRequest = WarehouseRentalRequest.builder()
                .customer(customer)
                .warehouse(warehouse)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .rentalPrice(warehouse.getRentalPrice())
                .purpose(trimToNull(request.purpose()))
                .status(RentalRequestStatus.Pending)
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(rentalRequestRepository.save(rentalRequest));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseRentalRequestResponse> findForCustomer(Integer customerId) {
        return rentalRequestRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseRentalRequestResponse> findForAdmin(Integer adminId, RentalRequestStatus status) {
        return rentalRequestRepository.findByAdminIdAndOptionalStatus(adminId, status).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public WarehouseRentalRequestResponse approve(Integer adminId, Integer requestId, WarehouseRentalRequestReviewRequest request) {
        WarehouseRentalRequest rentalRequest = getOwnedPendingRequest(adminId, requestId);

        LeaseContractRequest contractRequest = new LeaseContractRequest(
                rentalRequest.getCustomer().getCustomerId(),
                rentalRequest.getWarehouse().getWarehouseId(),
                rentalRequest.getStartDate(),
                rentalRequest.getEndDate(),
                rentalRequest.getRentalPrice(),
                LeaseContractStatus.Active,
                rentalRequest.getPurpose()
        );
        LeaseContractResponse contractResponse = leaseContractService.create(adminId, contractRequest);
        LeaseContract contract = leaseContractRepository.getReferenceById(contractResponse.contractId());

        rentalRequest.setStatus(RentalRequestStatus.Approved);
        rentalRequest.setContract(contract);
        rentalRequest.setReviewNote(trimToNull(request == null ? null : request.note()));
        rentalRequest.setReviewedAt(LocalDateTime.now());
        return toResponse(rentalRequest);
    }

    @Override
    @Transactional
    public WarehouseRentalRequestResponse reject(Integer adminId, Integer requestId, WarehouseRentalRequestReviewRequest request) {
        WarehouseRentalRequest rentalRequest = getOwnedPendingRequest(adminId, requestId);
        rentalRequest.setStatus(RentalRequestStatus.Rejected);
        rentalRequest.setReviewNote(trimToNull(request == null ? null : request.note()));
        rentalRequest.setReviewedAt(LocalDateTime.now());
        return toResponse(rentalRequest);
    }

    private WarehouseRentalRequest getOwnedPendingRequest(Integer adminId, Integer requestId) {
        WarehouseRentalRequest rentalRequest = rentalRequestRepository.findOwnedById(requestId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental request not found"));
        if (rentalRequest.getStatus() != RentalRequestStatus.Pending) {
            throw new BusinessRuleViolationException("Only pending rental requests can be reviewed");
        }
        validateDateRange(rentalRequest.getStartDate(), rentalRequest.getEndDate());
        return rentalRequest;
    }

    private void validateDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BusinessRuleViolationException("End date must be on or after start date");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private WarehouseRentalRequestResponse toResponse(WarehouseRentalRequest request) {
        return new WarehouseRentalRequestResponse(
                request.getRequestId(),
                request.getCustomer().getCustomerId(),
                request.getCustomer().getCustomerName(),
                request.getWarehouse().getWarehouseId(),
                request.getWarehouse().getWarehouseName(),
                request.getWarehouse().getAdmin().getAdminId(),
                request.getWarehouse().getAdmin().getAdminName(),
                request.getStartDate(),
                request.getEndDate(),
                request.getRentalPrice(),
                request.getPurpose(),
                request.getStatus(),
                request.getContract() == null ? null : request.getContract().getContractId(),
                request.getReviewNote(),
                request.getCreatedAt(),
                request.getReviewedAt()
        );
    }
}
