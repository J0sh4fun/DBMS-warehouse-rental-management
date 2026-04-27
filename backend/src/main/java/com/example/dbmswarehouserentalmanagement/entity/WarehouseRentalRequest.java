package com.example.dbmswarehouserentalmanagement.entity;

import com.example.dbmswarehouserentalmanagement.entity.enums.RentalRequestStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "WarehouseRentalRequest")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseRentalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RequestId")
    private Integer requestId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CustomerId", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "WarehouseId", nullable = false)
    private Warehouse warehouse;

    @Column(name = "StartDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "EndDate", nullable = false)
    private LocalDate endDate;

    @Column(name = "RentalPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal rentalPrice;

    @Column(name = "Purpose")
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private RentalRequestStatus status;

    @Column(name = "ReviewNote")
    private String reviewNote;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ContractId")
    private LeaseContract contract;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "ReviewedAt")
    private LocalDateTime reviewedAt;
}
