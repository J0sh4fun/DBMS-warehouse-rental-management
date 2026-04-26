package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.CreateOutboundIssueRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.OutboundIssueResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.PagedResponse;
import com.example.dbmswarehouserentalmanagement.entity.enums.IssueStatus;

import java.time.LocalDate;

public interface OutboundIssueService {

    OutboundIssueResponse create(Integer customerId, CreateOutboundIssueRequest request);

    OutboundIssueResponse updateDraft(Integer customerId, Integer issueId, CreateOutboundIssueRequest request);

    OutboundIssueResponse complete(Integer customerId, Integer issueId);

    OutboundIssueResponse cancel(Integer customerId, Integer issueId);

    PagedResponse<OutboundIssueResponse> findAll(
            Integer customerId,
            Integer warehouseId,
            IssueStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    );

    OutboundIssueResponse findById(Integer customerId, Integer issueId);
}
