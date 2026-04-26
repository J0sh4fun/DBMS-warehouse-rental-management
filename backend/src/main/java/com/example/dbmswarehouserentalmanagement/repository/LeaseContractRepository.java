package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.LeaseContract;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
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

    @Query("""
            select count(contract) > 0
            from LeaseContract contract
            where contract.customer.customerId = :customerId
              and contract.warehouse.warehouseId = :warehouseId
              and contract.status = :status
              and contract.startDate <= :today
              and contract.endDate >= :today
            """)
    boolean existsCurrentActiveLease(
            @Param("customerId") Integer customerId,
            @Param("warehouseId") Integer warehouseId,
            @Param("status") LeaseContractStatus status,
            @Param("today") LocalDate today
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update LeaseContract contract
            set contract.status = :expiredStatus
            where contract.status in :expirableStatuses
              and contract.endDate < :today
            """)
    int expireOverdueContracts(
            @Param("today") LocalDate today,
            @Param("expiredStatus") LeaseContractStatus expiredStatus,
            @Param("expirableStatuses") Collection<LeaseContractStatus> expirableStatuses
    );

    boolean existsByWarehouseWarehouseId(Integer warehouseId);

    List<LeaseContract> findByWarehouse_WarehouseId(Integer warehouseId);

    List<LeaseContract> findByCustomer_CustomerId(Integer customerId);

    List<LeaseContract> findByWarehouse_Admin_AdminId(Integer adminId);

    Optional<LeaseContract> findByContractIdAndWarehouse_Admin_AdminId(Integer contractId, Integer adminId);
}
