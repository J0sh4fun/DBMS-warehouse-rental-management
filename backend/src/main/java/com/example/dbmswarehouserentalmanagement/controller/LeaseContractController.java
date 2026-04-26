package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractRequest;
import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractStatusRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.LeaseContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/admin/lease-contracts", "/api/admin/contracts"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LeaseContractController {

    private final LeaseContractService leaseContractService;

    @PostMapping
    public ResponseEntity<LeaseContractResponse> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody LeaseContractRequest request
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(leaseContractService.create(adminId, request));
    }

    @GetMapping
    public ResponseEntity<List<LeaseContractResponse>> findAll(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) LeaseContractStatus status
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(leaseContractService.findAll(adminId, status));
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<LeaseContractResponse> findById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer contractId
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(leaseContractService.findById(adminId, contractId));
    }

    @PutMapping("/{contractId}")
    public ResponseEntity<LeaseContractResponse> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer contractId,
            @Valid @RequestBody LeaseContractRequest request
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(leaseContractService.update(adminId, contractId, request));
    }

    @PatchMapping("/{contractId}/status")
    public ResponseEntity<LeaseContractResponse> updateStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer contractId,
            @Valid @RequestBody LeaseContractStatusRequest request
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(leaseContractService.updateStatus(adminId, contractId, request.status()));
    }

    @DeleteMapping("/{contractId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer contractId
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        leaseContractService.delete(adminId, contractId);
        return ResponseEntity.noContent().build();
    }
}
