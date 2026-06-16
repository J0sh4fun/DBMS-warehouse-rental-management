package com.example.dbmswarehouserentalmanagement.entity;

import com.example.dbmswarehouserentalmanagement.entity.id.OutboundIssueDetailId;
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

@Entity
@Table(name = "chi_tiet_phieu_xuat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboundIssueDetail {

    @EmbeddedId
    private OutboundIssueDetailId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ma_phieu_xuat", referencedColumnName = "ma_phieu_xuat", nullable = false, insertable = false, updatable = false)
    private OutboundIssue outboundIssue;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ma_san_pham", referencedColumnName = "ma_san_pham", nullable = false, insertable = false, updatable = false)
    private Product product;

    @Column(name = "so_luong", nullable = false)
    private Integer quantity;

    @Column(name = "gia_ban", nullable = false, precision = 18, scale = 2)
    private BigDecimal sellingPrice;
}



