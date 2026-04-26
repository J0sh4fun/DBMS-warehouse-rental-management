package com.example.dbmswarehouserentalmanagement.dto.response;

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
public class ProductResponse {

    private Integer productId;

    private String productName;

    private BigDecimal currentPrice;

    private String unitOfMeasure;

    private Integer categoryId;

    private Integer customerId;
}
