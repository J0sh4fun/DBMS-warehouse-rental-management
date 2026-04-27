package com.example.dbmswarehouserentalmanagement.dto.response;

import com.example.dbmswarehouserentalmanagement.entity.enums.RentalRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record WarehouseRentalRequestResponse(
        Integer requestId,
        Integer customerId,
        String customerName,
        Integer warehouseId,
        String warehouseName,
        Integer adminId,
        String adminName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal rentalPrice,
        String purpose,
        RentalRequestStatus status,
        Integer contractId,
        String reviewNote,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
}
