package com.example.dbmswarehouserentalmanagement.entity;

import com.example.dbmswarehouserentalmanagement.entity.id.InboundReceiptDetailId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "chi_tiet_phieu_nhap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboundReceiptDetail {

    @EmbeddedId
    private InboundReceiptDetailId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ma_phieu_nhap", referencedColumnName = "ma_phieu_nhap", nullable = false, insertable = false, updatable = false)
    private InboundReceipt inboundReceipt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ma_san_pham", referencedColumnName = "ma_san_pham", nullable = false, insertable = false, updatable = false)
    private Product product;

    @Column(name = "so_luong", nullable = false)
    private Integer quantity;

    @Column(name = "gia_nhap", nullable = false, precision = 18, scale = 2)
    private BigDecimal importPrice;

    @Column(name = "han_su_dung")
    private LocalDate expiryDate;
}


