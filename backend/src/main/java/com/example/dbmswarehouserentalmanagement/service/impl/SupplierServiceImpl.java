package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.SupplierRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.SupplierResponse;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.entity.Supplier;
import com.example.dbmswarehouserentalmanagement.exception.ResourceNotFoundException;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.repository.SupplierRepository;
import com.example.dbmswarehouserentalmanagement.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request, Integer customerId) {
        Customer customer = resolveCustomer(customerId);

        Supplier supplier = Supplier.builder()
                .supplierName(request.getSupplierName().trim())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .customer(customer)
                .isDeleted(false)
                .build();

        return toResponse(supplierRepository.save(supplier));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getSuppliers(Integer customerId) {
        return supplierRepository.findByCustomer_CustomerIdAndIsDeletedFalse(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Integer supplierId, Integer customerId) {
        Supplier supplier = supplierRepository
                .findBySupplierIdAndCustomer_CustomerIdAndIsDeletedFalse(supplierId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        return toResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(Integer supplierId, SupplierRequest request, Integer customerId) {
        Supplier supplier = supplierRepository
                .findBySupplierIdAndCustomer_CustomerIdAndIsDeletedFalse(supplierId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        supplier.setSupplierName(request.getSupplierName().trim());
        supplier.setPhoneNumber(request.getPhoneNumber());
        supplier.setAddress(request.getAddress());

        return toResponse(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public void deleteSupplier(Integer supplierId, Integer customerId) {
        Supplier supplier = supplierRepository
                .findBySupplierIdAndCustomer_CustomerIdAndIsDeletedFalse(supplierId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        supplier.setDeleted(true);
        supplierRepository.save(supplier);
    }

    private Customer resolveCustomer(Integer customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .supplierId(supplier.getSupplierId())
                .supplierName(supplier.getSupplierName())
                .phoneNumber(supplier.getPhoneNumber())
                .address(supplier.getAddress())
                .customerId(supplier.getCustomer().getCustomerId())
                .build();
    }
}
