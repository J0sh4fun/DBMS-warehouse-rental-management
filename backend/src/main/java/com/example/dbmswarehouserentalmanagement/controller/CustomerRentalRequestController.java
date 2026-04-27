package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRentalRequestCreateRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseRentalRequestResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.WarehouseRentalRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/rental-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerRentalRequestController {

    private final WarehouseRentalRequestService rentalRequestService;

    @PostMapping
    public ResponseEntity<WarehouseRentalRequestResponse> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody WarehouseRentalRequestCreateRequest request
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalRequestService.create(customerId, request));
    }

    @GetMapping
    public ResponseEntity<List<WarehouseRentalRequestResponse>> findMine(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(rentalRequestService.findForCustomer(customerId));
    }
}
