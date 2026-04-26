package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByUserName(String userName);

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByUserNameOrEmail(String userName, String email);

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

    @Query("""
            select distinct customer
            from LeaseContract contract
            join contract.customer customer
            join contract.warehouse warehouse
            where warehouse.admin.adminId = :adminId
              and contract.status = :status
              and contract.startDate <= :today
              and contract.endDate >= :today
            order by customer.customerName asc
            """)
    List<Customer> findCurrentTenantsByAdminId(
            @Param("adminId") Integer adminId,
            @Param("status") LeaseContractStatus status,
            @Param("today") LocalDate today
    );
}

