package com.example.dbmswarehouserentalmanagement.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    private static final String CLAIM_USER_TYPE = "userType";
    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_USER_ROLE = "userRole";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-milliseconds}")
    private long jwtExpirationInMs;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(CustomUserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim(CLAIM_USER_TYPE, userDetails.getUserType().name())
                .claim(CLAIM_USER_ID, userDetails.getUserId())
                .claim(CLAIM_USER_ROLE, role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    public UserType getUserType(String token) {
        String userType = getClaims(token).get(CLAIM_USER_TYPE, String.class);
        return UserType.valueOf(userType);
    }

    public Integer getUserId(String token) {
        return getClaims(token).get(CLAIM_USER_ID, Integer.class);
    }

    public String getUserRole(String token) {
        return getClaims(token).get(CLAIM_USER_ROLE, String.class);
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SecurityException ex) {
            log.warn("Invalid JWT signature");
        } catch (io.jsonwebtoken.MalformedJwtException ex) {
            log.warn("Invalid JWT token");
        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            log.warn("Expired JWT token");
        } catch (io.jsonwebtoken.UnsupportedJwtException ex) {
            log.warn("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.warn("JWT claims string is empty");
        }
        return false;
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

