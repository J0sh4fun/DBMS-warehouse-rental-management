package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.SupplierRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.SupplierResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.UserType;
import com.example.dbmswarehouserentalmanagement.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/customer/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierRequest request,
                                                           Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        SupplierResponse response = supplierService.createSupplier(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getSuppliers(Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        return ResponseEntity.ok(supplierService.getSuppliers(customerId));
    }

    @GetMapping("/{supplierId}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Integer supplierId,
                                                            Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        return ResponseEntity.ok(supplierService.getSupplierById(supplierId, customerId));
    }

    @PutMapping("/{supplierId}")
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable Integer supplierId,
                                                           @Valid @RequestBody SupplierRequest request,
                                                           Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        SupplierResponse response = supplierService.updateSupplier(supplierId, request, customerId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{supplierId}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Integer supplierId,
                                               Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        supplierService.deleteSupplier(supplierId, customerId);
        return ResponseEntity.noContent().build();
    }

    private Integer getCurrentCustomerId(Authentication authentication) {
        if (authentication != null
                && authentication.getPrincipal() instanceof CustomUserDetails userDetails
                && userDetails.getUserType() == UserType.CUSTOMER) {
            return userDetails.getUserId();
        }
        throw new BadCredentialsException("Invalid authenticated customer");
    }
}
