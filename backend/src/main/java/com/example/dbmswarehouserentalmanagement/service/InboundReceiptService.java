package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.CreateInboundReceiptRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.InboundReceiptResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.PagedResponse;
import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;

import java.time.LocalDate;

public interface InboundReceiptService {

    InboundReceiptResponse create(Integer customerId, CreateInboundReceiptRequest request);

    InboundReceiptResponse updateDraft(Integer customerId, Integer receiptId, CreateInboundReceiptRequest request);

    InboundReceiptResponse complete(Integer customerId, Integer receiptId);

    InboundReceiptResponse cancel(Integer customerId, Integer receiptId);

    PagedResponse<InboundReceiptResponse> findAll(
            Integer customerId,
            Integer warehouseId,
            ReceiptStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    );

    InboundReceiptResponse findById(Integer customerId, Integer receiptId);
}
