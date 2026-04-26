package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.response.InventoryResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventorySummaryResponse;

import java.util.List;

public interface InventoryService {

    List<InventoryResponse> findInventory(Integer customerId, Integer warehouseId, Integer productId, String batchNo);

    List<InventorySummaryResponse> summarizeByProduct(Integer customerId, Integer warehouseId, Integer productId);
}
