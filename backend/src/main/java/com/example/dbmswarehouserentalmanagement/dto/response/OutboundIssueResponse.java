package com.example.dbmswarehouserentalmanagement.dto.response;

import com.example.dbmswarehouserentalmanagement.entity.enums.IssueStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OutboundIssueResponse(
        Integer issueId,
        Integer warehouseId,
        String warehouseName,
        Integer buyerId,
        String buyerName,
        LocalDateTime issueDate,
        IssueStatus status,
        LocalDateTime createdAt,
        List<OutboundIssueDetailResponse> details
) {
}
