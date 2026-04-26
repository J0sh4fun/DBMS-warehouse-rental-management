package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;
import com.example.dbmswarehouserentalmanagement.service.LeaseContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/contracts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LeaseContractController {

    private final LeaseContractService leaseContractService;

    @PostMapping
    public ResponseEntity<LeaseContractResponse> createContract(@Valid @RequestBody LeaseContractRequest request,
                                                                Principal principal) {
        LeaseContractResponse response = leaseContractService.createContract(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LeaseContractResponse>> getContracts(Principal principal) {
        return ResponseEntity.ok(leaseContractService.getContractsByCurrentAdmin(principal.getName()));
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<LeaseContractResponse> getContractById(@PathVariable Integer contractId,
                                                                 Principal principal) {
        return ResponseEntity.ok(leaseContractService.getContractById(contractId, principal.getName()));
    }

    @PutMapping("/{contractId}")
    public ResponseEntity<LeaseContractResponse> updateContract(@PathVariable Integer contractId,
                                                                @Valid @RequestBody LeaseContractRequest request,
                                                                Principal principal) {
        LeaseContractResponse response = leaseContractService.updateContract(contractId, request, principal.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{contractId}")
    public ResponseEntity<Void> deleteContract(@PathVariable Integer contractId,
                                               Principal principal) {
        leaseContractService.deleteContract(contractId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}

