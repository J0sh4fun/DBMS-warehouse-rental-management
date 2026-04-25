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
@Table(name = "Customer", uniqueConstraints = {
        @UniqueConstraint(name = "uk_customer_username", columnNames = "UserName"),
        @UniqueConstraint(name = "uk_customer_email", columnNames = "Email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CustomerId")
    private Integer customerId;

    @Column(name = "CustomerName", nullable = false)
    private String customerName;

    @Column(name = "UserName", nullable = false, length = 100)
    private String userName;

    @Column(name = "Email", nullable = false)
    private String email;

    @Column(name = "Password", nullable = false)
    private String password;

    @Column(name = "PhoneNumber", length = 30)
    private String phoneNumber;

    @Column(name = "Address")
    private String address;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}

