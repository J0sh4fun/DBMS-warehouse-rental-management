package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    Optional<Supplier> findBySupplierIdAndCustomerCustomerIdAndIsDeletedFalse(Integer supplierId, Integer customerId);

    List<Supplier> findByCustomer_CustomerId(Integer customerId);

    Optional<Supplier> findBySupplierIdAndCustomer_CustomerId(Integer supplierId, Integer customerId);

    List<Supplier> findByCustomer_CustomerIdAndIsDeletedFalse(Integer customerId);

    Optional<Supplier> findBySupplierIdAndCustomer_CustomerIdAndIsDeletedFalse(Integer supplierId, Integer customerId);
}
