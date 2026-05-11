package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.CreateInboundReceiptRequest;
import com.example.dbmswarehouserentalmanagement.dto.request.InboundReceiptDetailRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.InboundReceiptDetailResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InboundReceiptResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.PagedResponse;
import com.example.dbmswarehouserentalmanagement.entity.InboundReceipt;
import com.example.dbmswarehouserentalmanagement.entity.InboundReceiptDetail;
import com.example.dbmswarehouserentalmanagement.entity.Product;
import com.example.dbmswarehouserentalmanagement.entity.Supplier;
import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;
import com.example.dbmswarehouserentalmanagement.entity.id.InboundReceiptDetailId;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.DbmsJdbcRepository;
import com.example.dbmswarehouserentalmanagement.repository.InboundReceiptDetailRepository;
import com.example.dbmswarehouserentalmanagement.repository.InboundReceiptRepository;
import com.example.dbmswarehouserentalmanagement.repository.LeaseContractRepository;
import com.example.dbmswarehouserentalmanagement.repository.ProductRepository;
import com.example.dbmswarehouserentalmanagement.repository.SupplierRepository;
import com.example.dbmswarehouserentalmanagement.repository.WarehouseRepository;
import com.example.dbmswarehouserentalmanagement.service.InboundReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InboundReceiptServiceImpl implements InboundReceiptService {

    private final InboundReceiptRepository inboundReceiptRepository;
    private final InboundReceiptDetailRepository inboundReceiptDetailRepository;
    private final DbmsJdbcRepository dbmsJdbcRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final LeaseContractRepository leaseContractRepository;

    @Override
    @Transactional
    public InboundReceiptResponse create(Integer customerId, CreateInboundReceiptRequest request) {
        ReceiptStatus status = request.status() == null ? ReceiptStatus.Draft : request.status();
        if (status == ReceiptStatus.Cancelled) {
            throw new IllegalArgumentException("Cannot create an inbound receipt directly as Cancelled");
        }
        if (status == ReceiptStatus.Completed) {
            throw new IllegalArgumentException("Create inbound receipts as Draft and use the complete endpoint");
        }
        validateActiveWarehouseLease(customerId, request.warehouseId());

        Supplier supplier = getOwnedSupplier(customerId, request.supplierId());
        Warehouse warehouse = getWarehouse(request.warehouseId());

        InboundReceipt receipt = InboundReceipt.builder()
                .warehouse(warehouse)
                .supplier(supplier)
                .receiptDate(request.receiptDate() == null ? LocalDateTime.now() : request.receiptDate())
                .status(ReceiptStatus.Draft)
                .createdAt(LocalDateTime.now())
                .build();
        InboundReceipt savedReceipt = inboundReceiptRepository.saveAndFlush(receipt);

        List<InboundReceiptDetail> details = buildDetails(customerId, savedReceipt, request.details());
        inboundReceiptDetailRepository.saveAll(details);
        inboundReceiptDetailRepository.flush();

        return toResponse(savedReceipt, details);
    }

    @Override
    @Transactional
    public InboundReceiptResponse updateDraft(Integer customerId, Integer receiptId, CreateInboundReceiptRequest request) {
        InboundReceipt receipt = getOwnedReceipt(customerId, receiptId);
        if (receipt.getStatus() != ReceiptStatus.Draft) {
            throw new IllegalStateException("Only Draft inbound receipts can be updated");
        }
        if (request.status() != null && request.status() != ReceiptStatus.Draft) {
            throw new IllegalArgumentException("Use complete or cancel endpoint to change receipt status");
        }
        validateActiveWarehouseLease(customerId, request.warehouseId());

        receipt.setWarehouse(getWarehouse(request.warehouseId()));
        receipt.setSupplier(getOwnedSupplier(customerId, request.supplierId()));
        receipt.setReceiptDate(request.receiptDate() == null ? receipt.getReceiptDate() : request.receiptDate());
        receipt.setStatus(ReceiptStatus.Draft);
        inboundReceiptRepository.saveAndFlush(receipt);

        inboundReceiptDetailRepository.deleteByReceiptId(receiptId);
        inboundReceiptRepository.flush();

        List<InboundReceiptDetail> details = buildDetails(customerId, receipt, request.details());
        inboundReceiptDetailRepository.saveAll(details);
        return toResponse(receipt, details);
    }

    @Override
    @Transactional
    public InboundReceiptResponse complete(Integer customerId, Integer receiptId) {
        InboundReceipt receipt = getOwnedReceipt(customerId, receiptId);
        if (receipt.getStatus() == ReceiptStatus.Completed) {
            return findById(customerId, receiptId);
        }
        if (receipt.getStatus() == ReceiptStatus.Cancelled) {
            throw new IllegalStateException("Cancelled inbound receipt cannot be completed");
        }
        validateActiveWarehouseLease(customerId, receipt.getWarehouse().getWarehouseId());

        List<InboundReceiptDetail> details = inboundReceiptDetailRepository.findDetailsByReceiptId(receiptId);
        if (details.isEmpty()) {
            throw new IllegalStateException("Inbound receipt has no details");
        }

        dbmsJdbcRepository.completeInboundReceipt(receiptId);
        receipt.setStatus(ReceiptStatus.Completed);
        return toResponse(receipt, details);
    }

    @Override
    @Transactional
    public InboundReceiptResponse cancel(Integer customerId, Integer receiptId) {
        InboundReceipt receipt = getOwnedReceipt(customerId, receiptId);
        if (receipt.getStatus() == ReceiptStatus.Completed) {
            throw new IllegalStateException("Completed inbound receipt cannot be cancelled");
        }
        receipt.setStatus(ReceiptStatus.Cancelled);
        return toResponse(receipt, inboundReceiptDetailRepository.findDetailsByReceiptId(receiptId));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<InboundReceiptResponse> findAll(
            Integer customerId,
            Integer warehouseId,
            ReceiptStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    ) {
        Page<InboundReceipt> result = inboundReceiptRepository.findByCustomerAndFilters(
                customerId,
                warehouseId,
                status,
                toStartOfDay(fromDate),
                toExclusiveEndOfDay(toDate),
                PageRequest.of(Math.max(page, 0), normalizePageSize(size), Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        List<InboundReceiptResponse> content = result.stream()
                .map(receipt -> toResponse(receipt, inboundReceiptDetailRepository.findDetailsByReceiptId(receipt.getReceiptId())))
                .toList();
        return new PagedResponse<>(content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public InboundReceiptResponse findById(Integer customerId, Integer receiptId) {
        InboundReceipt receipt = getOwnedReceipt(customerId, receiptId);
        return toResponse(receipt, inboundReceiptDetailRepository.findDetailsByReceiptId(receiptId));
    }

    private InboundReceipt getOwnedReceipt(Integer customerId, Integer receiptId) {
        return inboundReceiptRepository.findOwnedById(receiptId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Inbound receipt not found"));
    }

    private Supplier getOwnedSupplier(Integer customerId, Integer supplierId) {
        return supplierRepository
                .findBySupplierIdAndCustomerCustomerIdAndIsDeletedFalse(supplierId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
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

    private List<InboundReceiptDetail> buildDetails(
            Integer customerId,
            InboundReceipt receipt,
            List<InboundReceiptDetailRequest> requests
    ) {
        List<InboundReceiptDetail> details = requests.stream()
                .map(detailRequest -> toDetail(customerId, receipt, detailRequest))
                .toList();
        ensureNoDuplicateBatches(details);
        return details;
    }

    private InboundReceiptDetail toDetail(
            Integer customerId,
            InboundReceipt receipt,
            InboundReceiptDetailRequest request
    ) {
        String batchNo = normalizeBatchNo(request.batchNo());
        Product product = productRepository
                .findByProductIdAndCustomerCustomerIdAndIsDeletedFalse(request.productId(), customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.productId()));

        return InboundReceiptDetail.builder()
                .id(new InboundReceiptDetailId(receipt.getReceiptId(), product.getProductId(), batchNo))
                .inboundReceipt(receipt)
                .product(product)
                .quantity(request.quantity())
                .importPrice(request.importPrice())
                .expiryDate(request.expiryDate())
                .build();
    }

    private void ensureNoDuplicateBatches(List<InboundReceiptDetail> details) {
        Set<InboundReceiptDetailId> ids = new HashSet<>();
        for (InboundReceiptDetail detail : details) {
            if (!ids.add(detail.getId())) {
                throw new IllegalArgumentException("Duplicate product and batch in inbound receipt: "
                        + detail.getId().getProductId() + "/" + detail.getId().getBatchNo());
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

    private InboundReceiptResponse toResponse(InboundReceipt receipt, List<InboundReceiptDetail> details) {
        return new InboundReceiptResponse(
                receipt.getReceiptId(),
                receipt.getWarehouse().getWarehouseId(),
                receipt.getWarehouse().getWarehouseName(),
                receipt.getSupplier().getSupplierId(),
                receipt.getSupplier().getSupplierName(),
                receipt.getReceiptDate(),
                receipt.getStatus(),
                receipt.getCreatedAt(),
                details.stream().map(this::toDetailResponse).toList()
        );
    }

    private InboundReceiptDetailResponse toDetailResponse(InboundReceiptDetail detail) {
        return new InboundReceiptDetailResponse(
                detail.getProduct().getProductId(),
                detail.getProduct().getProductName(),
                detail.getId().getBatchNo(),
                detail.getQuantity(),
                detail.getImportPrice(),
                detail.getExpiryDate()
        );
    }
}
