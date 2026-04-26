package com.example.dbmswarehouserentalmanagement.dto.request;

import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import jakarta.validation.constraints.NotNull;

public record LeaseContractStatusRequest(
        @NotNull(message = "Status is required")
        LeaseContractStatus status
) {
}
