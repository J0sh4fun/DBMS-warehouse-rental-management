package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.LeaseContractRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.LeaseContractResponse;

import java.util.List;

public interface LeaseContractService {

    LeaseContractResponse createContract(LeaseContractRequest request, String currentIdentifier);

    List<LeaseContractResponse> getContractsByCurrentAdmin(String currentIdentifier);

    LeaseContractResponse getContractById(Integer contractId, String currentIdentifier);

    LeaseContractResponse updateContract(Integer contractId, LeaseContractRequest request, String currentIdentifier);

    void deleteContract(Integer contractId, String currentIdentifier);
}

