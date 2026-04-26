package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.CategoryRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request, Integer customerId);

    List<CategoryResponse> getCategories(Integer customerId);

    CategoryResponse getCategoryById(Integer categoryId, Integer customerId);

    CategoryResponse updateCategory(Integer categoryId, CategoryRequest request, Integer customerId);

    void deleteCategory(Integer categoryId, Integer customerId);
}
