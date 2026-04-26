package com.example.dbmswarehouserentalmanagement.dto.response;

import java.math.BigDecimal;

public record InventoryValueResponse(
        BigDecimal totalValue
) {
}
