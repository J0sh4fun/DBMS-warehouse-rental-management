package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/warehouses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<WarehouseResponse> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody WarehouseRequest request
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseService.create(adminId, request));
    }

    @GetMapping
    public ResponseEntity<List<WarehouseResponse>> findAll(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(warehouseService.findAll(adminId));
    }

    @GetMapping("/{warehouseId}")
    public ResponseEntity<WarehouseResponse> findById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer warehouseId
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(warehouseService.findById(adminId, warehouseId));
    }

    @PutMapping("/{warehouseId}")
    public ResponseEntity<WarehouseResponse> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer warehouseId,
            @Valid @RequestBody WarehouseRequest request
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        return ResponseEntity.ok(warehouseService.update(adminId, warehouseId, request));
    }

    @DeleteMapping("/{warehouseId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer warehouseId
    ) {
        Integer adminId = SecurityPrincipalUtils.requireAdminId(userDetails);
        warehouseService.delete(adminId, warehouseId);
        return ResponseEntity.noContent().build();
    }
}
