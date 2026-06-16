package com.example.dbmswarehouserentalmanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "khach_hang", uniqueConstraints = {
        @UniqueConstraint(name = "uk_customer_username", columnNames = "ten_dang_nhap"),
        @UniqueConstraint(name = "uk_customer_email", columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_khach_hang")
    private Integer customerId;

    @Column(name = "ten_khach_hang", nullable = false)
    private String customerName;

    @Column(name = "ten_dang_nhap", nullable = false, length = 100)
    private String userName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "mat_khau", nullable = false)
    private String password;

    @Column(name = "so_dien_thoai", length = 30)
    private String phoneNumber;

    @Column(name = "dia_chi")
    private String address;

    @Column(name = "tao_luc", nullable = false)
    private LocalDateTime createdAt;
}


