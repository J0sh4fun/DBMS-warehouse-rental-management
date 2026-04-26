package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.CreateInboundReceiptRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.InboundReceiptResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.PagedResponse;
import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.InboundReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/inbound-receipts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class InboundReceiptController {

    private final InboundReceiptService inboundReceiptService;

    @PostMapping
    public ResponseEntity<InboundReceiptResponse> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateInboundReceiptRequest request
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(inboundReceiptService.create(customerId, request));
    }

    @PutMapping("/{receiptId}")
    public ResponseEntity<InboundReceiptResponse> updateDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer receiptId,
            @Valid @RequestBody CreateInboundReceiptRequest request
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(inboundReceiptService.updateDraft(customerId, receiptId, request));
    }

    @PatchMapping("/{receiptId}/complete")
    public ResponseEntity<InboundReceiptResponse> complete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer receiptId
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(inboundReceiptService.complete(customerId, receiptId));
    }

    @PatchMapping("/{receiptId}/cancel")
    public ResponseEntity<InboundReceiptResponse> cancel(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer receiptId
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(inboundReceiptService.cancel(customerId, receiptId));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<InboundReceiptResponse>> findAll(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) ReceiptStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(inboundReceiptService.findAll(customerId, warehouseId, status, fromDate, toDate, page, size));
    }

    @GetMapping("/{receiptId}")
    public ResponseEntity<InboundReceiptResponse> findById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer receiptId
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(inboundReceiptService.findById(customerId, receiptId));
    }
}
