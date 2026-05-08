package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Inventory;
import com.example.dbmswarehouserentalmanagement.entity.id.InventoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, InventoryId> {

    @Query("""
            select count(inventory) > 0
            from Inventory inventory
            where inventory.id.warehouseId = :warehouseId
            """)
    boolean existsByWarehouseId(@Param("warehouseId") Integer warehouseId);

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
