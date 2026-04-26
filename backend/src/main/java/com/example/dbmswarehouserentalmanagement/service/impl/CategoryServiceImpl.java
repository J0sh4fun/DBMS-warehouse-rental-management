package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.CategoryRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.CategoryResponse;
import com.example.dbmswarehouserentalmanagement.entity.Category;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.CategoryRepository;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, Integer customerId) {
        Customer customer = resolveCustomer(customerId);

        Category category = Category.builder()
                .categoryName(request.getCategoryName().trim())
                .customer(customer)
                .isDeleted(false)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Integer customerId) {
        return categoryRepository.findByCustomer_CustomerIdAndIsDeletedFalse(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Integer categoryId, Integer customerId) {
        Category category = categoryRepository
                .findByCategoryIdAndCustomer_CustomerIdAndIsDeletedFalse(categoryId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        return toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Integer categoryId, CategoryRequest request, Integer customerId) {
        Category category = categoryRepository
                .findByCategoryIdAndCustomer_CustomerIdAndIsDeletedFalse(categoryId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setCategoryName(request.getCategoryName().trim());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Integer categoryId, Integer customerId) {
        Category category = categoryRepository
                .findByCategoryIdAndCustomer_CustomerIdAndIsDeletedFalse(categoryId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setDeleted(true);
        categoryRepository.save(category);
    }

    private Customer resolveCustomer(Integer customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .customerId(category.getCustomer().getCustomerId())
                .build();
    }
}
