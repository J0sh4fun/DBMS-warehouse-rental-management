package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.BuyerRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.BuyerResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.UserType;
import com.example.dbmswarehouserentalmanagement.service.BuyerService;
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
@RequestMapping("/api/customer/buyers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class BuyerController {

    private final BuyerService buyerService;

    @PostMapping
    public ResponseEntity<BuyerResponse> createBuyer(@Valid @RequestBody BuyerRequest request,
                                                     Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        BuyerResponse response = buyerService.createBuyer(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BuyerResponse>> getBuyers(Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        return ResponseEntity.ok(buyerService.getBuyers(customerId));
    }

    @GetMapping("/{buyerId}")
    public ResponseEntity<BuyerResponse> getBuyerById(@PathVariable Integer buyerId,
                                                      Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        return ResponseEntity.ok(buyerService.getBuyerById(buyerId, customerId));
    }

    @PutMapping("/{buyerId}")
    public ResponseEntity<BuyerResponse> updateBuyer(@PathVariable Integer buyerId,
                                                     @Valid @RequestBody BuyerRequest request,
                                                     Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        BuyerResponse response = buyerService.updateBuyer(buyerId, request, customerId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{buyerId}")
    public ResponseEntity<Void> deleteBuyer(@PathVariable Integer buyerId,
                                            Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        buyerService.deleteBuyer(buyerId, customerId);
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

