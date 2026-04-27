package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRentalRequestCreateRequest;
import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRentalRequestReviewRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseRentalRequestResponse;
import com.example.dbmswarehouserentalmanagement.entity.enums.RentalRequestStatus;

import java.util.List;

public interface WarehouseRentalRequestService {

    WarehouseRentalRequestResponse create(Integer customerId, WarehouseRentalRequestCreateRequest request);

    List<WarehouseRentalRequestResponse> findForCustomer(Integer customerId);

    List<WarehouseRentalRequestResponse> findForAdmin(Integer adminId, RentalRequestStatus status);

    WarehouseRentalRequestResponse approve(Integer adminId, Integer requestId, WarehouseRentalRequestReviewRequest request);

    WarehouseRentalRequestResponse reject(Integer adminId, Integer requestId, WarehouseRentalRequestReviewRequest request);
}
