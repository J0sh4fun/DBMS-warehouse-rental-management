package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.response.ExpiringBatchResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventoryValueResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.TopProductResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inventory-value")
    public ResponseEntity<InventoryValueResponse> getInventoryValue(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(reportService.getInventoryValue(customerId));
    }

    @GetMapping("/expiring-batches")
    public ResponseEntity<List<ExpiringBatchResponse>> findExpiringBatches(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate expiresOnOrBefore
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(reportService.findExpiringBatches(customerId, expiresOnOrBefore));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductResponse>> findTopProducts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM")
            YearMonth month,
            @RequestParam(defaultValue = "10") int limit
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(reportService.findTopProducts(customerId, month, limit));
    }
}
