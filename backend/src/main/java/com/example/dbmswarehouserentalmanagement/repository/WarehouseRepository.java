package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.WarehouseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {

    List<Warehouse> findByAdminAdminIdOrderByWarehouseIdDesc(Integer adminId);

    List<Warehouse> findByStatusOrderByWarehouseIdDesc(WarehouseStatus status);

    @Query("""
            select warehouse
            from Warehouse warehouse
            join fetch warehouse.admin admin
            where warehouse.status = :status
              and warehouse.rentalPrice is not null
              and warehouse.rentalPrice > 0
              and not exists (
                  select contract.contractId
                  from LeaseContract contract
                  where contract.warehouse = warehouse
                    and contract.status in :blockedStatuses
                    and contract.startDate <= :endDate
                    and contract.endDate >= :startDate
              )
            order by warehouse.warehouseId desc
            """)
    List<Warehouse> findAvailableForRental(
            @Param("status") WarehouseStatus status,
            @Param("blockedStatuses") Collection<LeaseContractStatus> blockedStatuses,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    Optional<Warehouse> findByWarehouseIdAndAdminAdminId(Integer warehouseId, Integer adminId);

    List<Warehouse> findByAdmin_AdminId(Integer adminId);

    Optional<Warehouse> findByWarehouseIdAndAdmin_AdminId(Integer warehouseId, Integer adminId);
}
