package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;
import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;

import java.util.List;

public interface LeaseContractService {

    LeaseContractResponse create(Integer adminId, LeaseContractRequest request);

    LeaseContractResponse update(Integer adminId, Integer contractId, LeaseContractRequest request);

    LeaseContractResponse updateStatus(Integer adminId, Integer contractId, LeaseContractStatus status);

    List<LeaseContractResponse> findAll(Integer adminId, LeaseContractStatus status);

    LeaseContractResponse findById(Integer adminId, Integer contractId);
}
