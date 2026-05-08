package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.response.InventoryResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventorySummaryResponse;
import com.example.dbmswarehouserentalmanagement.entity.Inventory;
import com.example.dbmswarehouserentalmanagement.repository.DbmsJdbcRepository;
import com.example.dbmswarehouserentalmanagement.repository.InventoryRepository;
import com.example.dbmswarehouserentalmanagement.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final DbmsJdbcRepository dbmsJdbcRepository;

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
        return dbmsJdbcRepository.findInventorySummary(customerId, warehouseId, productId);
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

}
