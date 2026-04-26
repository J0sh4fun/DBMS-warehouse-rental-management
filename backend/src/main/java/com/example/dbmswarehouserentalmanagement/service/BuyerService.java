package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.BuyerRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.BuyerResponse;

import java.util.List;

public interface BuyerService {

    BuyerResponse createBuyer(BuyerRequest request, Integer customerId);

    List<BuyerResponse> getBuyers(Integer customerId);

    BuyerResponse getBuyerById(Integer buyerId, Integer customerId);

    BuyerResponse updateBuyer(Integer buyerId, BuyerRequest request, Integer customerId);

    void deleteBuyer(Integer buyerId, Integer customerId);
}

