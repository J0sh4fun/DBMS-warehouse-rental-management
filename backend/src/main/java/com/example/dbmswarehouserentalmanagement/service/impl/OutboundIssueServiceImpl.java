package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.CreateOutboundIssueRequest;
import com.example.dbmswarehouserentalmanagement.dto.request.OutboundIssueDetailRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.OutboundIssueDetailResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventoryResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.OutboundIssueResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.PagedResponse;
import com.example.dbmswarehouserentalmanagement.entity.Buyer;
import com.example.dbmswarehouserentalmanagement.entity.OutboundIssue;
import com.example.dbmswarehouserentalmanagement.entity.OutboundIssueDetail;
import com.example.dbmswarehouserentalmanagement.entity.Product;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.enums.IssueStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.entity.id.OutboundIssueDetailId;
import com.example.dbmswarehouserentalmanagement.exception.InsufficientInventoryException;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.BuyerRepository;
import com.example.dbmswarehouserentalmanagement.repository.DbmsJdbcRepository;
import com.example.dbmswarehouserentalmanagement.repository.LeaseContractRepository;
import com.example.dbmswarehouserentalmanagement.repository.OutboundIssueDetailRepository;
import com.example.dbmswarehouserentalmanagement.repository.OutboundIssueRepository;
import com.example.dbmswarehouserentalmanagement.repository.ProductRepository;
import com.example.dbmswarehouserentalmanagement.repository.WarehouseRepository;
import com.example.dbmswarehouserentalmanagement.service.OutboundIssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OutboundIssueServiceImpl implements OutboundIssueService {

    private final OutboundIssueRepository outboundIssueRepository;
    private final OutboundIssueDetailRepository outboundIssueDetailRepository;
    private final DbmsJdbcRepository dbmsJdbcRepository;
    private final BuyerRepository buyerRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final LeaseContractRepository leaseContractRepository;

    @Override
    @Transactional
    public OutboundIssueResponse create(Integer customerId, CreateOutboundIssueRequest request) {
        IssueStatus status = request.status() == null ? IssueStatus.Draft : request.status();
        if (status == IssueStatus.Cancelled) {
            throw new IllegalArgumentException("Cannot create an outbound issue directly as Cancelled");
        }
        if (status == IssueStatus.Completed) {
            throw new IllegalArgumentException("Create outbound issues as Draft and use the complete endpoint");
        }
        validateActiveWarehouseLease(customerId, request.warehouseId());

        Buyer buyer = getOwnedBuyer(customerId, request.buyerId());
        Warehouse warehouse = getWarehouse(request.warehouseId());

        OutboundIssue issue = OutboundIssue.builder()
                .warehouse(warehouse)
                .buyer(buyer)
                .issueDate(request.issueDate() == null ? LocalDateTime.now() : request.issueDate())
                .status(IssueStatus.Draft)
                .createdAt(LocalDateTime.now())
                .build();
        OutboundIssue savedIssue = outboundIssueRepository.saveAndFlush(issue);

        List<OutboundIssueDetail> details = buildDetails(customerId, savedIssue, request.details());
        validateDraftInventoryAvailability(customerId, savedIssue.getWarehouse().getWarehouseId(), details);
        outboundIssueDetailRepository.saveAll(details);
        outboundIssueDetailRepository.flush();

        return toResponse(savedIssue, details);
    }

    @Override
    @Transactional
    public OutboundIssueResponse updateDraft(Integer customerId, Integer issueId, CreateOutboundIssueRequest request) {
        OutboundIssue issue = getOwnedIssue(customerId, issueId);
        if (issue.getStatus() != IssueStatus.Draft) {
            throw new IllegalStateException("Only Draft outbound issues can be updated");
        }
        if (request.status() != null && request.status() != IssueStatus.Draft) {
            throw new IllegalArgumentException("Use complete or cancel endpoint to change issue status");
        }
        validateActiveWarehouseLease(customerId, request.warehouseId());

        issue.setWarehouse(getWarehouse(request.warehouseId()));
        issue.setBuyer(getOwnedBuyer(customerId, request.buyerId()));
        issue.setIssueDate(request.issueDate() == null ? issue.getIssueDate() : request.issueDate());
        issue.setStatus(IssueStatus.Draft);
        outboundIssueRepository.saveAndFlush(issue);

        outboundIssueDetailRepository.deleteByIssueId(issueId);
        outboundIssueRepository.flush();

        List<OutboundIssueDetail> details = buildDetails(customerId, issue, request.details());
        validateDraftInventoryAvailability(customerId, issue.getWarehouse().getWarehouseId(), details);
        outboundIssueDetailRepository.saveAll(details);
        return toResponse(issue, details);
    }

    @Override
    @Transactional
    public OutboundIssueResponse complete(Integer customerId, Integer issueId) {
        OutboundIssue issue = getOwnedIssue(customerId, issueId);
        if (issue.getStatus() == IssueStatus.Completed) {
            return findById(customerId, issueId);
        }
        if (issue.getStatus() == IssueStatus.Cancelled) {
            throw new IllegalStateException("Cancelled outbound issue cannot be completed");
        }
        validateActiveWarehouseLease(customerId, issue.getWarehouse().getWarehouseId());

        List<OutboundIssueDetail> details = outboundIssueDetailRepository.findDetailsByIssueId(issueId);
        if (details.isEmpty()) {
            throw new IllegalStateException("Outbound issue has no details");
        }

        dbmsJdbcRepository.completeOutboundIssue(issueId);
        issue.setStatus(IssueStatus.Completed);
        return toResponse(issue, details);
    }

    @Override
    @Transactional
    public OutboundIssueResponse cancel(Integer customerId, Integer issueId) {
        OutboundIssue issue = getOwnedIssue(customerId, issueId);
        if (issue.getStatus() == IssueStatus.Completed) {
            throw new IllegalStateException("Completed outbound issue cannot be cancelled");
        }
        issue.setStatus(IssueStatus.Cancelled);
        return toResponse(issue, outboundIssueDetailRepository.findDetailsByIssueId(issueId));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OutboundIssueResponse> findAll(
            Integer customerId,
            Integer warehouseId,
            IssueStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    ) {
        Page<OutboundIssue> result = outboundIssueRepository.findByCustomerAndFilters(
                customerId,
                warehouseId,
                status,
                toStartOfDay(fromDate),
                toExclusiveEndOfDay(toDate),
                PageRequest.of(Math.max(page, 0), normalizePageSize(size), Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        List<OutboundIssueResponse> content = result.stream()
                .map(issue -> toResponse(issue, outboundIssueDetailRepository.findDetailsByIssueId(issue.getIssueId())))
                .toList();
        return new PagedResponse<>(content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public OutboundIssueResponse findById(Integer customerId, Integer issueId) {
        OutboundIssue issue = getOwnedIssue(customerId, issueId);
        return toResponse(issue, outboundIssueDetailRepository.findDetailsByIssueId(issueId));
    }

    private OutboundIssue getOwnedIssue(Integer customerId, Integer issueId) {
        return outboundIssueRepository.findOwnedById(issueId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Outbound issue not found"));
    }

    private Buyer getOwnedBuyer(Integer customerId, Integer buyerId) {
        return buyerRepository
                .findByBuyerIdAndCustomerCustomerIdAndIsDeletedFalse(buyerId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
    }

    private Warehouse getWarehouse(Integer warehouseId) {
        return warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));
    }

    private void validateActiveWarehouseLease(Integer customerId, Integer warehouseId) {
        boolean hasActiveLease = leaseContractRepository.existsCurrentActiveLease(
                customerId,
                warehouseId,
                LeaseContractStatus.Active,
                LocalDate.now()
        );
        if (!hasActiveLease) {
            throw new IllegalStateException("Customer does not have an active lease contract for this warehouse");
        }
    }

    private List<OutboundIssueDetail> buildDetails(
            Integer customerId,
            OutboundIssue issue,
            List<OutboundIssueDetailRequest> requests
    ) {
        List<OutboundIssueDetail> details = requests.stream()
                .map(detailRequest -> toDetail(customerId, issue, detailRequest))
                .toList();
        ensureNoDuplicateBatches(details);
        return details;
    }

    private OutboundIssueDetail toDetail(
            Integer customerId,
            OutboundIssue issue,
            OutboundIssueDetailRequest request
    ) {
        String batchNo = normalizeBatchNo(request.batchNo());
        Product product = productRepository
                .findByProductIdAndCustomerCustomerIdAndIsDeletedFalse(request.productId(), customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.productId()));

        return OutboundIssueDetail.builder()
                .id(new OutboundIssueDetailId(issue.getIssueId(), product.getProductId(), batchNo))
                .outboundIssue(issue)
                .product(product)
                .quantity(request.quantity())
                .sellingPrice(request.sellingPrice())
                .build();
    }

    private void ensureNoDuplicateBatches(List<OutboundIssueDetail> details) {
        Set<OutboundIssueDetailId> ids = new HashSet<>();
        for (OutboundIssueDetail detail : details) {
            if (!ids.add(detail.getId())) {
                throw new IllegalArgumentException("Duplicate product and batch in outbound issue: "
                        + detail.getId().getProductId() + "/" + detail.getId().getBatchNo());
            }
        }
    }

    private void validateDraftInventoryAvailability(
            Integer customerId,
            Integer warehouseId,
            List<OutboundIssueDetail> details
    ) {
        Map<String, Integer> inventoryByBatch = new HashMap<>();
        for (InventoryResponse inventoryItem : dbmsJdbcRepository.findInventory(customerId, warehouseId, null, null)) {
            inventoryByBatch.put(inventoryKey(inventoryItem.productId(), inventoryItem.batchNo()), inventoryItem.quantity());
        }

        for (OutboundIssueDetail detail : details) {
            int availableQuantity = inventoryByBatch.getOrDefault(
                    inventoryKey(detail.getProduct().getProductId(), detail.getId().getBatchNo()),
                    0
            );
            if (detail.getQuantity() > availableQuantity) {
                throw new InsufficientInventoryException(
                        "Available quantity for batch "
                                + detail.getId().getBatchNo()
                                + " of product "
                                + detail.getProduct().getProductName()
                                + " is "
                                + availableQuantity
                                + ", cannot create draft with quantity "
                                + detail.getQuantity()
                );
            }
        }
    }

    private String normalizeBatchNo(String batchNo) {
        String normalized = batchNo == null ? "" : batchNo.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Batch number is required");
        }
        return normalized;
    }

    private String inventoryKey(Integer productId, String batchNo) {
        return productId + "::" + batchNo;
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 100);
    }

    private LocalDateTime toStartOfDay(LocalDate date) {
        return date == null ? null : date.atStartOfDay();
    }

    private LocalDateTime toExclusiveEndOfDay(LocalDate date) {
        return date == null ? null : date.plusDays(1).atStartOfDay();
    }

    private OutboundIssueResponse toResponse(OutboundIssue issue, List<OutboundIssueDetail> details) {
        return new OutboundIssueResponse(
                issue.getIssueId(),
                issue.getWarehouse().getWarehouseId(),
                issue.getWarehouse().getWarehouseName(),
                issue.getBuyer().getBuyerId(),
                issue.getBuyer().getBuyerName(),
                issue.getIssueDate(),
                issue.getStatus(),
                issue.getCreatedAt(),
                details.stream().map(this::toDetailResponse).toList()
        );
    }

    private OutboundIssueDetailResponse toDetailResponse(OutboundIssueDetail detail) {
        return new OutboundIssueDetailResponse(
                detail.getProduct().getProductId(),
                detail.getProduct().getProductName(),
                detail.getId().getBatchNo(),
                detail.getQuantity(),
                detail.getSellingPrice()
        );
    }
}
