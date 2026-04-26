package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.InboundReceiptDetail;
import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;
import com.example.dbmswarehouserentalmanagement.entity.id.InboundReceiptDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface InboundReceiptDetailRepository extends JpaRepository<InboundReceiptDetail, InboundReceiptDetailId> {

    @Query("""
            select detail
            from InboundReceiptDetail detail
            join fetch detail.product product
            where detail.inboundReceipt.receiptId = :receiptId
            order by product.productName, detail.id.batchNo
            """)
    List<InboundReceiptDetail> findDetailsByReceiptId(@Param("receiptId") Integer receiptId);

    @Modifying
    @Query("delete from InboundReceiptDetail detail where detail.inboundReceipt.receiptId = :receiptId")
    void deleteByReceiptId(@Param("receiptId") Integer receiptId);

    @Query("""
            select detail, inventory.quantity
            from InboundReceiptDetail detail
            join detail.inboundReceipt receipt
            join receipt.supplier supplier
            join detail.product product
            , Inventory inventory
            where supplier.customer.customerId = :customerId
              and receipt.status = :status
              and detail.expiryDate is not null
              and detail.expiryDate >= :fromDate
              and detail.expiryDate <= :toDate
              and inventory.warehouse = receipt.warehouse
              and inventory.product = product
              and inventory.id.batchNo = detail.id.batchNo
              and inventory.quantity > 0
            order by detail.expiryDate asc, product.productName asc
            """)
    List<Object[]> findExpiringBatches(
            @Param("customerId") Integer customerId,
            @Param("status") ReceiptStatus status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}
