package com.pgfinder.auth.util;

import com.pgfinder.auth.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationTime; // in milliseconds

    @Value("${jwt.issuer}")
    private String issuer;

    @Value("${jwt.audience}")
    private String audience;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        // Matching .NET claims
        // ClaimTypes.NameIdentifier -> usually mapped to 'sub' or 'nameid'
        // ClaimTypes.Email -> 'email'
        // ClaimTypes.Name -> 'unique_name' or 'name'
        // ClaimTypes.Role -> 'role'

        claims.put("nameid", String.valueOf(user.getUserId())); // ClaimTypes.NameIdentifier
        claims.put("email", user.getEmail());
        claims.put("name", user.getFullName()); // ClaimTypes.Name
        claims.put("role", user.getRole().getRoleName()); // ClaimTypes.Role

        // Standard claims
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(String.valueOf(user.getUserId())) // Also setting subject as UserId standard
                .setIssuer(issuer)
                .setAudience(audience)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
