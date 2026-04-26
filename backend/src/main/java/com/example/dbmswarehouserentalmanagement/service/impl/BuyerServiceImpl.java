package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.BuyerRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.BuyerResponse;
import com.example.dbmswarehouserentalmanagement.entity.Buyer;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.BuyerRepository;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.service.BuyerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuyerServiceImpl implements BuyerService {

    private final BuyerRepository buyerRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public BuyerResponse createBuyer(BuyerRequest request, Integer customerId) {
        Customer customer = resolveCustomer(customerId);

        Buyer buyer = Buyer.builder()
                .buyerName(request.getBuyerName().trim())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .customer(customer)
                .isDeleted(false)
                .build();

        return toResponse(buyerRepository.save(buyer));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BuyerResponse> getBuyers(Integer customerId) {
        return buyerRepository.findByCustomer_CustomerIdAndIsDeletedFalse(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BuyerResponse getBuyerById(Integer buyerId, Integer customerId) {
        Buyer buyer = buyerRepository
                .findByBuyerIdAndCustomer_CustomerIdAndIsDeletedFalse(buyerId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));

        return toResponse(buyer);
    }

    @Override
    @Transactional
    public BuyerResponse updateBuyer(Integer buyerId, BuyerRequest request, Integer customerId) {
        Buyer buyer = buyerRepository
                .findByBuyerIdAndCustomer_CustomerIdAndIsDeletedFalse(buyerId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));

        buyer.setBuyerName(request.getBuyerName().trim());
        buyer.setEmail(request.getEmail());
        buyer.setPhoneNumber(request.getPhoneNumber());
        buyer.setAddress(request.getAddress());

        return toResponse(buyerRepository.save(buyer));
    }

    @Override
    @Transactional
    public void deleteBuyer(Integer buyerId, Integer customerId) {
        Buyer buyer = buyerRepository
                .findByBuyerIdAndCustomer_CustomerIdAndIsDeletedFalse(buyerId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));

        buyer.setDeleted(true);
        buyerRepository.save(buyer);
    }

    private Customer resolveCustomer(Integer customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private BuyerResponse toResponse(Buyer buyer) {
        return BuyerResponse.builder()
                .buyerId(buyer.getBuyerId())
                .buyerName(buyer.getBuyerName())
                .email(buyer.getEmail())
                .phoneNumber(buyer.getPhoneNumber())
                .address(buyer.getAddress())
                .customerId(buyer.getCustomer().getCustomerId())
                .build();
    }
}
