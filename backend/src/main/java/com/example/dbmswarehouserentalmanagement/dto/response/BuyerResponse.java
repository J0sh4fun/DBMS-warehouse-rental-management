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
public class BuyerResponse {

    private Integer buyerId;

    private String buyerName;

    private String email;

    private String phoneNumber;

    private String address;

    private Integer customerId;
}

