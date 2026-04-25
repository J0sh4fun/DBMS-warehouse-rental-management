package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Integer> {

    Optional<Admin> findByUserName(String userName);

    Optional<Admin> findByEmail(String email);

    Optional<Admin> findByUserNameOrEmail(String userName, String email);

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);
}

