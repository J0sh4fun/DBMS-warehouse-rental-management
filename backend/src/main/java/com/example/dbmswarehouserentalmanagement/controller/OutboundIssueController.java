package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.CreateOutboundIssueRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.OutboundIssueResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.PagedResponse;
import com.example.dbmswarehouserentalmanagement.entity.enums.IssueStatus;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.SecurityPrincipalUtils;
import com.example.dbmswarehouserentalmanagement.service.OutboundIssueService;
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
@RequestMapping("/api/outbound-issues")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class OutboundIssueController {

    private final OutboundIssueService outboundIssueService;

    @PostMapping
    public ResponseEntity<OutboundIssueResponse> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateOutboundIssueRequest request
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(outboundIssueService.create(customerId, request));
    }

    @PutMapping("/{issueId}")
    public ResponseEntity<OutboundIssueResponse> updateDraft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer issueId,
            @Valid @RequestBody CreateOutboundIssueRequest request
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(outboundIssueService.updateDraft(customerId, issueId, request));
    }

    @PatchMapping("/{issueId}/complete")
    public ResponseEntity<OutboundIssueResponse> complete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer issueId
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(outboundIssueService.complete(customerId, issueId));
    }

    @PatchMapping("/{issueId}/cancel")
    public ResponseEntity<OutboundIssueResponse> cancel(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer issueId
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(outboundIssueService.cancel(customerId, issueId));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<OutboundIssueResponse>> findAll(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(outboundIssueService.findAll(customerId, warehouseId, status, fromDate, toDate, page, size));
    }

    @GetMapping("/{issueId}")
    public ResponseEntity<OutboundIssueResponse> findById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer issueId
    ) {
        Integer customerId = SecurityPrincipalUtils.requireCustomerId(userDetails);
        return ResponseEntity.ok(outboundIssueService.findById(customerId, issueId));
    }
}
