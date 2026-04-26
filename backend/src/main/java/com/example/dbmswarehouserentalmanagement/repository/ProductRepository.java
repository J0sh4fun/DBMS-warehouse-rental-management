package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByCustomer_CustomerId(Integer customerId);

    Optional<Product> findByProductIdAndCustomer_CustomerId(Integer productId, Integer customerId);

    List<Product> findByCustomer_CustomerIdAndIsDeletedFalse(Integer customerId);

    Optional<Product> findByProductIdAndCustomer_CustomerIdAndIsDeletedFalse(Integer productId, Integer customerId);
}

