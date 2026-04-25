package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.request.LoginRequest;
import com.example.dbmswarehouserentalmanagement.dto.request.RegisterRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.JwtAuthResponse;
import com.example.dbmswarehouserentalmanagement.entity.Admin;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import com.example.dbmswarehouserentalmanagement.exception.ResourceConflictException;
import com.example.dbmswarehouserentalmanagement.repository.AdminRepository;
import com.example.dbmswarehouserentalmanagement.repository.CustomerRepository;
import com.example.dbmswarehouserentalmanagement.security.CustomUserDetails;
import com.example.dbmswarehouserentalmanagement.security.JwtTokenProvider;
import com.example.dbmswarehouserentalmanagement.security.UserType;
import com.example.dbmswarehouserentalmanagement.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional(readOnly = true)
    public JwtAuthResponse login(LoginRequest request) {
        String identifier = request.getUsername().trim();

        CustomUserDetails userDetails = switch (request.getUserType()) {
            case ADMIN -> adminRepository.findByUserNameOrEmail(identifier, identifier)
                    .map(CustomUserDetails::fromAdmin)
                    .orElseThrow(() -> new BadCredentialsException("Invalid username/email or password"));
            case CUSTOMER -> customerRepository.findByUserNameOrEmail(identifier, identifier)
                    .map(CustomUserDetails::fromCustomer)
                    .orElseThrow(() -> new BadCredentialsException("Invalid username/email or password"));
        };

        if (!passwordEncoder.matches(request.getPassword(), userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid username/email or password");
        }

        String token = jwtTokenProvider.generateToken(userDetails);
        return JwtAuthResponse.builder()
                .token(token)
                .type(TOKEN_TYPE)
                .userRole(userDetails.getAuthorities().iterator().next().getAuthority())
                .userId(userDetails.getUserId())
                .build();
    }

    @Override
    @Transactional
    public JwtAuthResponse registerCustomer(RegisterRequest request) {
        validateUniqueIdentity(request.getUsername(), request.getEmail());

        Customer customer = Customer.builder()
                .customerName(request.getName().trim())
                .userName(request.getUsername().trim())
                .email(request.getEmail().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .createdAt(LocalDateTime.now())
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        CustomUserDetails userDetails = CustomUserDetails.fromCustomer(savedCustomer);

        return JwtAuthResponse.builder()
                .token(jwtTokenProvider.generateToken(userDetails))
                .type(TOKEN_TYPE)
                .userRole("ROLE_CUSTOMER")
                .userId(savedCustomer.getCustomerId())
                .build();
    }

    @Override
    @Transactional
    public JwtAuthResponse registerAdmin(RegisterRequest request) {
        validateUniqueIdentity(request.getUsername(), request.getEmail());

        Admin admin = Admin.builder()
                .adminName(request.getName().trim())
                .userName(request.getUsername().trim())
                .email(request.getEmail().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();

        Admin savedAdmin = adminRepository.save(admin);
        CustomUserDetails userDetails = CustomUserDetails.fromAdmin(savedAdmin);

        return JwtAuthResponse.builder()
                .token(jwtTokenProvider.generateToken(userDetails))
                .type(TOKEN_TYPE)
                .userRole("ROLE_ADMIN")
                .userId(savedAdmin.getAdminId())
                .build();
    }

    private void validateUniqueIdentity(String username, String email) {
        if (adminRepository.existsByUserName(username) || customerRepository.existsByUserName(username)) {
            throw new ResourceConflictException("Username already exists");
        }
        if (adminRepository.existsByEmail(email) || customerRepository.existsByEmail(email)) {
            throw new ResourceConflictException("Email already exists");
        }
    }
}

