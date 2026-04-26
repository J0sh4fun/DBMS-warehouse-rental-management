package com.example.dbmswarehouserentalmanagement.dto.response;

import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaseContractResponse {

    private Integer contractId;

    private Integer customerId;

    private Integer warehouseId;

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal rentalPrice;

    private LeaseContractStatus status;

    private String purpose;

    private LocalDateTime createdAt;
}

