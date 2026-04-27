package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRentalRequestReviewRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseRentalRequestResponse;
import com.example.dbmswarehouserentalmanagement.entity.enums.RentalRequestStatus;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.WarehouseRentalRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rental-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRentalRequestController {

    private final WarehouseRentalRequestService rentalRequestService;

    @GetMapping
    public ResponseEntity<List<WarehouseRentalRequestResponse>> findAll(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) RentalRequestStatus status
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(rentalRequestService.findForAdmin(adminId, status));
    }

    @PatchMapping("/{requestId}/approve")
    public ResponseEntity<WarehouseRentalRequestResponse> approve(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer requestId,
            @Valid @RequestBody(required = false) WarehouseRentalRequestReviewRequest request
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(rentalRequestService.approve(adminId, requestId, request));
    }

    @PatchMapping("/{requestId}/reject")
    public ResponseEntity<WarehouseRentalRequestResponse> reject(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer requestId,
            @Valid @RequestBody(required = false) WarehouseRentalRequestReviewRequest request
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(rentalRequestService.reject(adminId, requestId, request));
    }
}
