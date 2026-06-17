package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.ProductRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.ProductResponse;
import com.example.dbmswarehouserentalmanagement.entity.Category;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.entity.Product;
import com.example.dbmswarehouserentalmanagement.exception.ResourceConflictException;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.CategoryRepository;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.repository.InboundReceiptDetailRepository;
import com.example.dbmswarehouserentalmanagement.repository.InventoryRepository;
import com.example.dbmswarehouserentalmanagement.repository.OutboundIssueDetailRepository;
import com.example.dbmswarehouserentalmanagement.repository.ProductRepository;
import com.example.dbmswarehouserentalmanagement.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerRepository customerRepository;
    private final InventoryRepository inventoryRepository;
    private final InboundReceiptDetailRepository inboundReceiptDetailRepository;
    private final OutboundIssueDetailRepository outboundIssueDetailRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, Integer customerId) {
        Customer customer = resolveCustomer(customerId);
        Category category = resolveCategory(request.getCategoryId(), customerId);

        Product product = Product.builder()
                .productName(request.getProductName().trim())
                .currentPrice(request.getCurrentPrice())
                .unitOfMeasure(request.getUnitOfMeasure().trim())
                .customer(customer)
                .category(category)
                .isDeleted(false)
                .build();

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProducts(Integer customerId) {
        return productRepository.findByCustomer_CustomerIdAndIsDeletedFalse(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Integer productId, Integer customerId) {
        Product product = productRepository
                .findByProductIdAndCustomer_CustomerIdAndIsDeletedFalse(productId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Integer productId, ProductRequest request, Integer customerId) {
        Product product = productRepository
                .findByProductIdAndCustomer_CustomerIdAndIsDeletedFalse(productId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = resolveCategory(request.getCategoryId(), customerId);

        product.setProductName(request.getProductName().trim());
        product.setCurrentPrice(request.getCurrentPrice());
        product.setUnitOfMeasure(request.getUnitOfMeasure().trim());
        product.setCategory(category);

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Integer productId, Integer customerId) {
        Product product = productRepository
                .findByProductIdAndCustomer_CustomerIdAndIsDeletedFalse(productId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        ensureProductCanBeDeleted(productId);

        product.setDeleted(true);
        productRepository.save(product);
    }

    private void ensureProductCanBeDeleted(Integer productId) {
        if (inventoryRepository.existsByProductId(productId)) {
            throw new ResourceConflictException("Product cannot be deleted because it still has inventory records");
        }
        if (inboundReceiptDetailRepository.existsByProductId(productId)) {
            throw new ResourceConflictException("Product cannot be deleted because it is used in inbound receipts");
        }
        if (outboundIssueDetailRepository.existsByProductId(productId)) {
            throw new ResourceConflictException("Product cannot be deleted because it is used in outbound issues");
        }
    }

    private Customer resolveCustomer(Integer customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private Category resolveCategory(Integer categoryId, Integer customerId) {
        return categoryRepository.findByCategoryIdAndCustomer_CustomerIdAndIsDeletedFalse(categoryId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .currentPrice(product.getCurrentPrice())
                .unitOfMeasure(product.getUnitOfMeasure())
                .categoryId(product.getCategory().getCategoryId())
                .customerId(product.getCustomer().getCustomerId())
                .build();
    }
}
