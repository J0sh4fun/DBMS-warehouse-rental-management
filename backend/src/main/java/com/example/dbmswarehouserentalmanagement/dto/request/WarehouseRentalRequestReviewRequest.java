package com.example.dbmswarehouserentalmanagement.dto.request;

import jakarta.validation.constraints.Size;

public record WarehouseRentalRequestReviewRequest(
        @Size(max = 255, message = "Review note must be at most 255 characters")
        String note
) {
}
