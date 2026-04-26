package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.response.InventoryResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventorySummaryResponse;
import com.example.dbmswarehouserentalmanagement.entity.Inventory;
import com.example.dbmswarehouserentalmanagement.repository.InventoryRepository;
import com.example.dbmswarehouserentalmanagement.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> findInventory(Integer customerId, Integer warehouseId, Integer productId, String batchNo) {
        String normalizedBatchNo = batchNo == null || batchNo.isBlank() ? null : batchNo.trim();
        return inventoryRepository.findByCustomerAndFilters(customerId, warehouseId, productId, normalizedBatchNo).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventorySummaryResponse> summarizeByProduct(Integer customerId, Integer warehouseId, Integer productId) {
        Map<Integer, InventorySummaryAccumulator> summaries = new LinkedHashMap<>();
        for (Inventory inventory : inventoryRepository.findByCustomerAndFilters(customerId, warehouseId, productId, null)) {
            summaries.computeIfAbsent(inventory.getProduct().getProductId(),
                    id -> new InventorySummaryAccumulator(
                            inventory.getProduct().getProductId(),
                            inventory.getProduct().getProductName(),
                            inventory.getProduct().getUnitOfMeasure()
                    )).add(inventory.getQuantity());
        }

        return summaries.values().stream()
                .map(InventorySummaryAccumulator::toResponse)
                .toList();
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getWarehouse().getWarehouseId(),
                inventory.getWarehouse().getWarehouseName(),
                inventory.getProduct().getProductId(),
                inventory.getProduct().getProductName(),
                inventory.getProduct().getUnitOfMeasure(),
                inventory.getId().getBatchNo(),
                inventory.getQuantity(),
                inventory.getLastUpdated()
        );
    }

    private static class InventorySummaryAccumulator {

        private final Integer productId;
        private final String productName;
        private final String unitOfMeasure;
        private long totalQuantity;

        private InventorySummaryAccumulator(Integer productId, String productName, String unitOfMeasure) {
            this.productId = productId;
            this.productName = productName;
            this.unitOfMeasure = unitOfMeasure;
        }

        private void add(Integer quantity) {
            totalQuantity += quantity;
        }

        private InventorySummaryResponse toResponse() {
            return new InventorySummaryResponse(productId, productName, unitOfMeasure, totalQuantity);
        }
    }
}
