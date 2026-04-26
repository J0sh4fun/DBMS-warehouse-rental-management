package com.example.dbmswarehouserentalmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    @Size(max = 255, message = "Supplier name must be at most 255 characters")
    private String supplierName;

    @Size(max = 30, message = "Phone number must be at most 30 characters")
    private String phoneNumber;

    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;
}

