package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BuyerRepository extends JpaRepository<Buyer, Integer> {

    Optional<Buyer> findByBuyerIdAndCustomerCustomerIdAndIsDeletedFalse(Integer buyerId, Integer customerId);

    List<Buyer> findByCustomer_CustomerId(Integer customerId);

    Optional<Buyer> findByBuyerIdAndCustomer_CustomerId(Integer buyerId, Integer customerId);

    List<Buyer> findByCustomer_CustomerIdAndIsDeletedFalse(Integer customerId);

    Optional<Buyer> findByBuyerIdAndCustomer_CustomerIdAndIsDeletedFalse(Integer buyerId, Integer customerId);
}
