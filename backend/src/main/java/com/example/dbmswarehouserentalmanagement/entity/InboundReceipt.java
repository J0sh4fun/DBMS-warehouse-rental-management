package com.example.dbmswarehouserentalmanagement.entity;

import com.example.dbmswarehouserentalmanagement.entity.enums.ReceiptStatus;
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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "InboundReceipt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboundReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReceiptId")
    private Integer receiptId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "WarehouseId", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "SupplierId", nullable = false)
    private Supplier supplier;

    @Column(name = "ReceiptDate", nullable = false)
    private LocalDateTime receiptDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private ReceiptStatus status;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}

