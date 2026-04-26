package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.response.AdminCustomerResponse;

import java.util.List;

public interface AdminCustomerService {

    List<AdminCustomerResponse> findAll();
}
