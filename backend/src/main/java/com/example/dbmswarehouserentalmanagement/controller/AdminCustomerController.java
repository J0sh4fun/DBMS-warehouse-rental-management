package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.response.AdminCustomerResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ResponseEntity<List<AdminCustomerResponse>> findCurrentTenants(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(adminCustomerService.findCurrentTenants(adminId));
    }
}
