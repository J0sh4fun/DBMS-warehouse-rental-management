package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    List<Category> findByCustomer_CustomerId(Integer customerId);

    Optional<Category> findByCategoryIdAndCustomer_CustomerId(Integer categoryId, Integer customerId);

    List<Category> findByCustomer_CustomerIdAndIsDeletedFalse(Integer customerId);

    Optional<Category> findByCategoryIdAndCustomer_CustomerIdAndIsDeletedFalse(Integer categoryId, Integer customerId);
}

