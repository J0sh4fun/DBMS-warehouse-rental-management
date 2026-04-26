package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.InboundReceipt;
import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InboundReceiptRepository extends JpaRepository<InboundReceipt, Integer> {

    @Query("""
            select distinct receipt
            from InboundReceipt receipt
            join fetch receipt.supplier supplier
            join fetch receipt.warehouse warehouse
            where supplier.customer.customerId = :customerId
            order by receipt.createdAt desc
            """)
    List<InboundReceipt> findAllByCustomerId(@Param("customerId") Integer customerId);

    @Query(
            value = """
                    select distinct receipt
                    from InboundReceipt receipt
                    join fetch receipt.supplier supplier
                    join fetch receipt.warehouse warehouse
                    where supplier.customer.customerId = :customerId
                      and (:warehouseId is null or warehouse.warehouseId = :warehouseId)
                      and (:status is null or receipt.status = :status)
                      and (:fromDate is null or receipt.receiptDate >= :fromDate)
                      and (:toDate is null or receipt.receiptDate < :toDate)
                    """,
            countQuery = """
                    select count(receipt)
                    from InboundReceipt receipt
                    join receipt.supplier supplier
                    join receipt.warehouse warehouse
                    where supplier.customer.customerId = :customerId
                      and (:warehouseId is null or warehouse.warehouseId = :warehouseId)
                      and (:status is null or receipt.status = :status)
                      and (:fromDate is null or receipt.receiptDate >= :fromDate)
                      and (:toDate is null or receipt.receiptDate < :toDate)
                    """
    )
    Page<InboundReceipt> findByCustomerAndFilters(
            @Param("customerId") Integer customerId,
            @Param("warehouseId") Integer warehouseId,
            @Param("status") ReceiptStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );

    @Query("""
            select receipt
            from InboundReceipt receipt
            join fetch receipt.supplier supplier
            join fetch receipt.warehouse warehouse
            where receipt.receiptId = :receiptId
              and supplier.customer.customerId = :customerId
            """)
    Optional<InboundReceipt> findOwnedById(
            @Param("receiptId") Integer receiptId,
            @Param("customerId") Integer customerId
    );

    boolean existsByWarehouseWarehouseId(Integer warehouseId);
}
