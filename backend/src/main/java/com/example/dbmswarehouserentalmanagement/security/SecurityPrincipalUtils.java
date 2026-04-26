package com.example.dbmswarehouserentalmanagement.security;

import org.springframework.security.access.AccessDeniedException;

public final class SecurityPrincipalUtils {

    private SecurityPrincipalUtils() {
    }

    public static Integer requireCustomerId(CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUserType() != UserType.CUSTOMER) {
            throw new AccessDeniedException("Customer access is required");
        }
        return userDetails.getUserId();
    }

    public static Integer requireAdminId(CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUserType() != UserType.ADMIN) {
            throw new AccessDeniedException("Admin access is required");
        }
        return userDetails.getUserId();
    }
}
