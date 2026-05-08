package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.OutboundIssueDetail;
import com.example.dbmswarehouserentalmanagement.entity.id.OutboundIssueDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
