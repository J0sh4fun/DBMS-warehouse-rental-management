package com.example.dbmswarehouserentalmanagement.dto.response;

import java.time.LocalDateTime;

public record AdminCustomerResponse(
        Integer customerId,
        String customerName,
        String username,
        String email,
        String phoneNumber,
        String address,
        LocalDateTime createdAt
) {
}
