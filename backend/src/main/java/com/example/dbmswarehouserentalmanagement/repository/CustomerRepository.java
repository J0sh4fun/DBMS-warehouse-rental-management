package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByUserName(String userName);

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByUserNameOrEmail(String userName, String email);

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);
}

