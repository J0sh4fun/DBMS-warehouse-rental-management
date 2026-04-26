package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BuyerRepository extends JpaRepository<Buyer, Integer> {

    Optional<Buyer> findByBuyerIdAndCustomerCustomerIdAndIsDeletedFalse(Integer buyerId, Integer customerId);
}
