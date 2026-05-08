package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.response.AdminCustomerResponse;
import com.example.dbmswarehouserentalmanagement.repository.DbmsJdbcRepository;
import com.example.dbmswarehouserentalmanagement.service.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCustomerServiceImpl implements AdminCustomerService {

    private final DbmsJdbcRepository dbmsJdbcRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdminCustomerResponse> findCurrentTenants(Integer adminId) {
        return dbmsJdbcRepository.findCurrentTenants(adminId);
    }
}
