package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.LeaseContract;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LeaseContractRepository extends JpaRepository<LeaseContract, Integer> {

    @Query("""
            select contract
            from LeaseContract contract
            join fetch contract.customer customer
            join fetch contract.warehouse warehouse
            join fetch warehouse.admin admin
            where admin.adminId = :adminId
              and (:status is null or contract.status = :status)
            order by contract.createdAt desc
            """)
    List<LeaseContract> findByAdminIdAndOptionalStatus(
            @Param("adminId") Integer adminId,
            @Param("status") LeaseContractStatus status
    );

    @Query("""
            select contract
            from LeaseContract contract
            join fetch contract.customer customer
            join fetch contract.warehouse warehouse
            join fetch warehouse.admin admin
            where contract.contractId = :contractId
              and admin.adminId = :adminId
            """)
    Optional<LeaseContract> findOwnedById(
            @Param("contractId") Integer contractId,
            @Param("adminId") Integer adminId
    );

    boolean existsByCustomerCustomerIdAndWarehouseWarehouseIdAndStatus(
            Integer customerId,
            Integer warehouseId,
            LeaseContractStatus status
    );
}
