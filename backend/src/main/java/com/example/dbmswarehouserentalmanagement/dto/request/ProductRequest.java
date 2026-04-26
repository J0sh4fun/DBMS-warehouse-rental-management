package com.example.dbmswarehouserentalmanagement.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must be at most 255 characters")
    private String productName;

    @NotNull(message = "Current price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Current price must be greater than 0")
    private BigDecimal currentPrice;

    @NotBlank(message = "Unit of measure is required")
    @Size(max = 100, message = "Unit of measure must be at most 100 characters")
    private String unitOfMeasure;

    @NotNull(message = "Category ID is required")
    private Integer categoryId;
}

