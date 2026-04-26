package com.example.dbmswarehouserentalmanagement.dto.request;

import com.example.dbmswarehouserentalmanagement.entity.enums.IssueStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record CreateOutboundIssueRequest(
        @NotNull(message = "Warehouse ID is required")
        Integer warehouseId,

        @NotNull(message = "Buyer ID is required")
        Integer buyerId,

        LocalDateTime issueDate,

        IssueStatus status,

        @NotEmpty(message = "Issue details are required")
        List<@Valid OutboundIssueDetailRequest> details
) {
}
