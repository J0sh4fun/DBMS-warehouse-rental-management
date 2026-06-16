package com.example.dbmswarehouserentalmanagement.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class InboundReceiptDetailId implements Serializable {

    @Column(name = "ma_phieu_nhap", nullable = false)
    private Integer receiptId;

    @Column(name = "ma_san_pham", nullable = false)
    private Integer productId;

    @Column(name = "so_lo", nullable = false, length = 100)
    private String batchNo;
}


