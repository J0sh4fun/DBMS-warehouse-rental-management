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
@Table(name = "quan_tri_vien", uniqueConstraints = {
        @UniqueConstraint(name = "uk_admin_username", columnNames = "ten_dang_nhap"),
        @UniqueConstraint(name = "uk_admin_email", columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_quan_tri_vien")
    private Integer adminId;

    @Column(name = "ten_quan_tri_vien", nullable = false)
    private String adminName;

    @Column(name = "ten_dang_nhap", nullable = false, length = 100)
    private String userName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "mat_khau", nullable = false)
    private String password;

    @Column(name = "tao_luc", nullable = false)
    private LocalDateTime createdAt;
}


