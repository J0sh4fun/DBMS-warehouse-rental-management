package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.ProductRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.ProductResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.UserType;
import com.example.dbmswarehouserentalmanagement.service.ProductService;
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
@RequestMapping("/api/customer/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request,
                                                         Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        ProductResponse response = productService.createProduct(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        return ResponseEntity.ok(productService.getProducts(customerId));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Integer productId,
                                                          Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        return ResponseEntity.ok(productService.getProductById(productId, customerId));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Integer productId,
                                                         @Valid @RequestBody ProductRequest request,
                                                         Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        ProductResponse response = productService.updateProduct(productId, request, customerId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer productId,
                                              Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        productService.deleteProduct(productId, customerId);
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

