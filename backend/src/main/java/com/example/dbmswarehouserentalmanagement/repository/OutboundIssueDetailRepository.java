package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.OutboundIssueDetail;
import com.example.dbmswarehouserentalmanagement.entity.enums.IssueStatus;
import com.example.dbmswarehouserentalmanagement.entity.id.OutboundIssueDetailId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OutboundIssueDetailRepository extends JpaRepository<OutboundIssueDetail, OutboundIssueDetailId> {

    @Query("""
            select detail
            from OutboundIssueDetail detail
            join fetch detail.product product
            where detail.outboundIssue.issueId = :issueId
            order by product.productName, detail.id.batchNo
            """)
    List<OutboundIssueDetail> findDetailsByIssueId(@Param("issueId") Integer issueId);

    @Modifying
    @Query("delete from OutboundIssueDetail detail where detail.outboundIssue.issueId = :issueId")
    void deleteByIssueId(@Param("issueId") Integer issueId);

    @Query("""
            select product.productId, product.productName, sum(detail.quantity)
            from OutboundIssueDetail detail
            join detail.outboundIssue issue
            join issue.buyer buyer
            join detail.product product
            where buyer.customer.customerId = :customerId
              and issue.status = :status
              and issue.issueDate >= :fromDate
              and issue.issueDate < :toDate
            group by product.productId, product.productName
            order by sum(detail.quantity) desc
            """)
    List<Object[]> findTopProducts(
            @Param("customerId") Integer customerId,
            @Param("status") IssueStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}
