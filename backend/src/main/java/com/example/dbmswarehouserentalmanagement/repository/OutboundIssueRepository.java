package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.OutboundIssue;
import com.example.dbmswarehouserentalmanagement.entity.enums.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OutboundIssueRepository extends JpaRepository<OutboundIssue, Integer> {

    @Query("""
            select distinct issue
            from OutboundIssue issue
            join fetch issue.buyer buyer
            join fetch issue.warehouse warehouse
            where buyer.customer.customerId = :customerId
            order by issue.createdAt desc
            """)
    List<OutboundIssue> findAllByCustomerId(@Param("customerId") Integer customerId);

    @Query(
            value = """
                    select distinct issue
                    from OutboundIssue issue
                    join fetch issue.buyer buyer
                    join fetch issue.warehouse warehouse
                    where buyer.customer.customerId = :customerId
                      and (:warehouseId is null or warehouse.warehouseId = :warehouseId)
                      and (:status is null or issue.status = :status)
                      and (:fromDate is null or issue.issueDate >= :fromDate)
                      and (:toDate is null or issue.issueDate < :toDate)
                    """,
            countQuery = """
                    select count(issue)
                    from OutboundIssue issue
                    join issue.buyer buyer
                    join issue.warehouse warehouse
                    where buyer.customer.customerId = :customerId
                      and (:warehouseId is null or warehouse.warehouseId = :warehouseId)
                      and (:status is null or issue.status = :status)
                      and (:fromDate is null or issue.issueDate >= :fromDate)
                      and (:toDate is null or issue.issueDate < :toDate)
                    """
    )
    Page<OutboundIssue> findByCustomerAndFilters(
            @Param("customerId") Integer customerId,
            @Param("warehouseId") Integer warehouseId,
            @Param("status") IssueStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );

    @Query("""
            select issue
            from OutboundIssue issue
            join fetch issue.buyer buyer
            join fetch issue.warehouse warehouse
            where issue.issueId = :issueId
              and buyer.customer.customerId = :customerId
            """)
    Optional<OutboundIssue> findOwnedById(
            @Param("issueId") Integer issueId,
            @Param("customerId") Integer customerId
    );
}
