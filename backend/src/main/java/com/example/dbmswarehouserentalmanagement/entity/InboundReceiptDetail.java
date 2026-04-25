package com.example.dbmswarehouserentalmanagement.entity;

import com.example.dbmswarehouserentalmanagement.entity.id.InboundReceiptDetailId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "InboundReceiptDetail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboundReceiptDetail {

    @EmbeddedId
    private InboundReceiptDetailId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("receiptId")
    @JoinColumn(name = "ReceiptId", nullable = false)
    private InboundReceipt inboundReceipt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("productId")
    @JoinColumn(name = "ProductId", nullable = false)
    private Product product;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @Column(name = "ImportPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal importPrice;

    @Column(name = "ExpiryDate")
    private LocalDate expiryDate;
}

