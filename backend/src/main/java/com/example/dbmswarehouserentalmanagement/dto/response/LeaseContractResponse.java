package com.example.dbmswarehouserentalmanagement.dto.response;

import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaseContractResponse(
        Integer contractId,
        Integer customerId,
        String customerName,
        Integer warehouseId,
        String warehouseName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal rentalPrice,
        LeaseContractStatus status,
        String purpose,
        LocalDateTime createdAt
) {
}
