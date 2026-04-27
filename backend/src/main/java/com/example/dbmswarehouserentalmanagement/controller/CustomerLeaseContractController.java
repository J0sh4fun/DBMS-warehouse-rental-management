package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.LeaseContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/contracts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerLeaseContractController {

    private final LeaseContractService leaseContractService;

    @GetMapping
    public ResponseEntity<List<LeaseContractResponse>> findCurrent(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(leaseContractService.findCurrentForCustomer(customerId));
    }
}
