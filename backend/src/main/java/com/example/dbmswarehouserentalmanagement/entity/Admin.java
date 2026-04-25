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
@Table(name = "Admin", uniqueConstraints = {
        @UniqueConstraint(name = "uk_admin_username", columnNames = "UserName"),
        @UniqueConstraint(name = "uk_admin_email", columnNames = "Email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AdminId")
    private Integer adminId;

    @Column(name = "AdminName", nullable = false)
    private String adminName;

    @Column(name = "UserName", nullable = false, length = 100)
    private String userName;

    @Column(name = "Email", nullable = false)
    private String email;

    @Column(name = "Password", nullable = false)
    private String password;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}

