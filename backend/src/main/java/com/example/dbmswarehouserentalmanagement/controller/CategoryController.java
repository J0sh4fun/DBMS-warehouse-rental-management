package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.CategoryRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.CategoryResponse;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.UserType;
import com.example.dbmswarehouserentalmanagement.service.CategoryService;
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
@RequestMapping("/api/customer/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request,
                                                           Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        CategoryResponse response = categoryService.createCategory(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        return ResponseEntity.ok(categoryService.getCategories(customerId));
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Integer categoryId,
                                                            Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        return ResponseEntity.ok(categoryService.getCategoryById(categoryId, customerId));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Integer categoryId,
                                                           @Valid @RequestBody CategoryRequest request,
                                                           Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        CategoryResponse response = categoryService.updateCategory(categoryId, request, customerId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer categoryId,
                                               Authentication authentication) {
        Integer customerId = getCurrentCustomerId(authentication);
        categoryService.deleteCategory(categoryId, customerId);
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

