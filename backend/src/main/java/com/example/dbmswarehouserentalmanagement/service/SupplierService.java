package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.dto.request.SupplierRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {

    SupplierResponse createSupplier(SupplierRequest request, Integer customerId);

    List<SupplierResponse> getSuppliers(Integer customerId);

    SupplierResponse getSupplierById(Integer supplierId, Integer customerId);

    SupplierResponse updateSupplier(Integer supplierId, SupplierRequest request, Integer customerId);

    void deleteSupplier(Integer supplierId, Integer customerId);
}
