package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Inventory;
import com.example.dbmswarehouserentalmanagement.entity.id.InventoryId;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, InventoryId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select inventory from Inventory inventory where inventory.id = :id")
    Optional<Inventory> findByIdForUpdate(@Param("id") InventoryId id);

    @Query("""
            select inventory
            from Inventory inventory
            join fetch inventory.product product
            join fetch inventory.warehouse warehouse
            where product.customer.customerId = :customerId
              and (:warehouseId is null or inventory.id.warehouseId = :warehouseId)
              and (:productId is null or inventory.id.productId = :productId)
              and (:batchNo is null or inventory.id.batchNo = :batchNo)
            order by product.productName, inventory.id.batchNo
            """)
    List<Inventory> findByCustomerAndFilters(
            @Param("customerId") Integer customerId,
            @Param("warehouseId") Integer warehouseId,
            @Param("productId") Integer productId,
            @Param("batchNo") String batchNo
    );
}
