package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.response.ExpiringBatchResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventoryValueResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.TopProductResponse;
import com.example.dbmswarehouserentalmanagement.entity.InboundReceiptDetail;
import com.example.dbmswarehouserentalmanagement.entity.Inventory;
import com.example.dbmswarehouserentalmanagement.entity.enums.IssueStatus;
import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;
import com.example.dbmswarehouserentalmanagement.repository.InboundReceiptDetailRepository;
import com.example.dbmswarehouserentalmanagement.repository.InventoryRepository;
import com.example.dbmswarehouserentalmanagement.repository.OutboundIssueDetailRepository;
import com.example.dbmswarehouserentalmanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final InventoryRepository inventoryRepository;
    private final InboundReceiptDetailRepository inboundReceiptDetailRepository;
    private final OutboundIssueDetailRepository outboundIssueDetailRepository;

    @Override
    @Transactional(readOnly = true)
    public InventoryValueResponse getInventoryValue(Integer customerId) {
        BigDecimal totalValue = BigDecimal.ZERO;
        for (Inventory inventory : inventoryRepository.findByCustomerAndFilters(customerId, null, null, null)) {
            totalValue = totalValue.add(inventory.getProduct().getCurrentPrice()
                    .multiply(BigDecimal.valueOf(inventory.getQuantity())));
        }
        return new InventoryValueResponse(totalValue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpiringBatchResponse> findExpiringBatches(Integer customerId, LocalDate expiresOnOrBefore) {
        LocalDate toDate = expiresOnOrBefore == null ? LocalDate.now().plusDays(30) : expiresOnOrBefore;
        return inboundReceiptDetailRepository
                .findExpiringBatches(customerId, ReceiptStatus.Completed, LocalDate.now(), toDate)
                .stream()
                .map(this::toExpiringBatchResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductResponse> findTopProducts(Integer customerId, YearMonth month, int limit) {
        YearMonth targetMonth = month == null ? YearMonth.now() : month;
        int safeLimit = limit <= 0 ? 10 : Math.min(limit, 100);
        LocalDateTime fromDate = targetMonth.atDay(1).atStartOfDay();
        LocalDateTime toDate = targetMonth.plusMonths(1).atDay(1).atStartOfDay();

        return outboundIssueDetailRepository
                .findTopProducts(customerId, IssueStatus.Completed, fromDate, toDate, PageRequest.of(0, safeLimit))
                .stream()
                .map(row -> new TopProductResponse(
                        (Integer) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue()
                ))
                .toList();
    }

    private ExpiringBatchResponse toExpiringBatchResponse(Object[] row) {
        InboundReceiptDetail detail = (InboundReceiptDetail) row[0];
        Integer currentQuantity = ((Number) row[1]).intValue();
        return new ExpiringBatchResponse(
                detail.getInboundReceipt().getReceiptId(),
                detail.getInboundReceipt().getWarehouse().getWarehouseId(),
                detail.getInboundReceipt().getWarehouse().getWarehouseName(),
                detail.getInboundReceipt().getSupplier().getSupplierId(),
                detail.getInboundReceipt().getSupplier().getSupplierName(),
                detail.getProduct().getProductId(),
                detail.getProduct().getProductName(),
                detail.getId().getBatchNo(),
                currentQuantity,
                detail.getExpiryDate()
        );
    }
}
