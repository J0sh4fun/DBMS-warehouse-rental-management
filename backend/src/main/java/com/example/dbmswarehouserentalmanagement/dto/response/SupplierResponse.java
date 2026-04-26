package com.example.dbmswarehouserentalmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponse {

    private Integer supplierId;

    private String supplierName;

    private String phoneNumber;

    private String address;

    private Integer customerId;
}
