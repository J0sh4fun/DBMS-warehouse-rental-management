package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.LoginRequest;
import com.example.dbmswarehouserentalmanagement.dto.request.RegisterRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.JwtAuthResponse;

public interface AuthService {

    JwtAuthResponse login(LoginRequest request);

    JwtAuthResponse registerCustomer(RegisterRequest request);

    JwtAuthResponse registerAdmin(RegisterRequest request);
}

