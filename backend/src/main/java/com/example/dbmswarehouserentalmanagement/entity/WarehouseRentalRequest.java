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
@Table(name = "yeu_cau_thue_kho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseRentalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_yeu_cau")
    private Integer requestId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ma_khach_hang", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ma_kho", nullable = false)
    private Warehouse warehouse;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate startDate;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate endDate;

    @Column(name = "gia_thue", nullable = false, precision = 18, scale = 2)
    private BigDecimal rentalPrice;

    @Column(name = "muc_dich")
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private RentalRequestStatus status;

    @Column(name = "ghi_chu_duyet")
    private String reviewNote;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_hop_dong")
    private LeaseContract contract;

    @Column(name = "tao_luc", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "duyet_luc")
    private LocalDateTime reviewedAt;
}

