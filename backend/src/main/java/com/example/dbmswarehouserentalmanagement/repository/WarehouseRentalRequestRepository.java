package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.WarehouseRentalRequest;
import com.example.dbmswarehouserentalmanagement.entity.enums.RentalRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WarehouseRentalRequestRepository extends JpaRepository<WarehouseRentalRequest, Integer> {

    @Query("""
            select request
            from WarehouseRentalRequest request
            join fetch request.customer customer
            join fetch request.warehouse warehouse
            join fetch warehouse.admin admin
            left join fetch request.contract contract
            where customer.customerId = :customerId
            order by request.createdAt desc
            """)
    List<WarehouseRentalRequest> findByCustomerId(@Param("customerId") Integer customerId);

    @Query("""
            select request
            from WarehouseRentalRequest request
            join fetch request.customer customer
            join fetch request.warehouse warehouse
            join fetch warehouse.admin admin
            left join fetch request.contract contract
            where admin.adminId = :adminId
              and (:status is null or request.status = :status)
            order by request.createdAt desc
            """)
    List<WarehouseRentalRequest> findByAdminIdAndOptionalStatus(
            @Param("adminId") Integer adminId,
            @Param("status") RentalRequestStatus status
    );

    @Query("""
            select request
            from WarehouseRentalRequest request
            join fetch request.customer customer
            join fetch request.warehouse warehouse
            join fetch warehouse.admin admin
            left join fetch request.contract contract
            where request.requestId = :requestId
              and admin.adminId = :adminId
            """)
    Optional<WarehouseRentalRequest> findOwnedById(
            @Param("requestId") Integer requestId,
            @Param("adminId") Integer adminId
    );
}
