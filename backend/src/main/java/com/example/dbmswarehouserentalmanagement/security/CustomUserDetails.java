package com.example.dbmswarehouserentalmanagement.security;

import com.example.dbmswarehouserentalmanagement.entity.Admin;
import com.example.dbmswarehouserentalmanagement.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomUserDetails implements UserDetails {

    private Integer userId;
    private UserType userType;
    private String username;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public static CustomUserDetails fromAdmin(Admin admin) {
        return CustomUserDetails.builder()
                .userId(admin.getAdminId())
                .userType(UserType.ADMIN)
                .username(admin.getUserName())
                .password(admin.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();
    }

    public static CustomUserDetails fromCustomer(Customer customer) {
        return CustomUserDetails.builder()
                .userId(customer.getCustomerId())
                .userType(UserType.CUSTOMER)
                .username(customer.getUserName())
                .password(customer.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

