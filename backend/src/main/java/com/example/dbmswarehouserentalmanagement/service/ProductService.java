package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.ProductRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request, Integer customerId);

    List<ProductResponse> getProducts(Integer customerId);

    ProductResponse getProductById(Integer productId, Integer customerId);

    ProductResponse updateProduct(Integer productId, ProductRequest request, Integer customerId);

    void deleteProduct(Integer productId, Integer customerId);
}
