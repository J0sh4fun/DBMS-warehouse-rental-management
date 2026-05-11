package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.response.InventoryResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventorySummaryResponse;
import com.example.dbmswarehouserentalmanagement.repository.DbmsJdbcRepository;
import com.example.dbmswarehouserentalmanagement.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final DbmsJdbcRepository dbmsJdbcRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> findInventory(Integer customerId, Integer warehouseId, Integer productId, String batchNo) {
        String normalizedBatchNo = batchNo == null || batchNo.isBlank() ? null : batchNo.trim();
        return dbmsJdbcRepository.findInventory(customerId, warehouseId, productId, normalizedBatchNo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventorySummaryResponse> summarizeByProduct(Integer customerId, Integer warehouseId, Integer productId) {
        return dbmsJdbcRepository.findInventorySummary(customerId, warehouseId, productId);
    }
}
