package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.InboundReceiptDetail;
import com.example.dbmswarehouserentalmanagement.entity.id.InboundReceiptDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InboundReceiptDetailRepository extends JpaRepository<InboundReceiptDetail, InboundReceiptDetailId> {

    @Query("""
            select count(detail) > 0
            from InboundReceiptDetail detail
            where detail.id.productId = :productId
            """)
    boolean existsByProductId(@Param("productId") Integer productId);

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
}
