package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.response.AdminCustomerResponse;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.service.LeaseContractExpirationService;
import com.example.dbmswarehouserentalmanagement.service.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCustomerServiceImpl implements AdminCustomerService {

    private final CustomerRepository customerRepository;
    private final LeaseContractExpirationService leaseContractExpirationService;

    @Override
    @Transactional(readOnly = true)
    public List<AdminCustomerResponse> findCurrentTenants(Integer adminId) {
        leaseContractExpirationService.expireOverdueContracts();
        LocalDate today = LocalDate.now();
        return customerRepository.findCurrentTenantsByAdminId(adminId, LeaseContractStatus.Active, today).stream()
                .map(this::toResponse)
                .toList();
    }

    private AdminCustomerResponse toResponse(Customer customer) {
        return new AdminCustomerResponse(
                customer.getCustomerId(),
                customer.getCustomerName(),
                customer.getUserName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getCreatedAt()
        );
    }
}
