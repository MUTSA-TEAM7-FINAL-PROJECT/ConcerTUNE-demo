package com.team7.ConcerTUNE.security;

import com.team7.ConcerTUNE.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret-b64:}")
    private String secretKeyB64;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    private Key signKey;

    @PostConstruct
    void initKey() {
        if (secretKeyB64 == null || secretKeyB64.isBlank()) {
            throw new IllegalStateException("JWT secret is missing: set jwt.secret-b64 / JWT_SECRET_B64");
        }
        byte[] keyBytes = Decoders.BASE64.decode(secretKeyB64);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be >= 32 bytes after Base64 decoding.");
        }
        this.signKey = Keys.hmacShaKeyFor(keyBytes);
    }

    private Key getSignInKey() { return signKey; }

    public String generateToken(User user) {
        Map<String, Object> extra = new HashMap<>();

        extra.put("id", user.getId());
        extra.put("email", user.getEmail());
        extra.put("username", user.getUsername());
        extra.put("profileImageUrl", user.getProfileImageUrl());
        extra.put("role", user.getAuth().name());
        extra.put("bio",user.getBio());
        extra.put("phoneNum",user.getPhoneNum());

        return generateToken(extra, user);
    }

    public String generateToken(Map<String, Object> extra, User user) {
        return buildToken(extra, user, jwtExpirationMs);
    }

    public String generateRefreshToken(User user) {
        return buildToken(new HashMap<>(), user, refreshExpirationMs);
    }

    private String buildToken(Map<String, Object> claims, User user, long expMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, String username) {
        final String sub = extractUsername(token);
        final boolean notExpired = extractExpiration(token).after(new Date());
        String expected = username;

        return notExpired && sub.equals(expected);
    }


    // 추출관련 메소드

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).get("username", String.class);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            throw new CredentialsExpiredException("토큰이 만료되었습니다.", e);
        } catch (Exception e) {
            throw new BadCredentialsException("유효하지 않은 토큰입니다.", e);
        }
    }

    public SimpleUserDetails createSimpleUserDetailsFromClaims(Claims claims) {
        Long userId = claims.get("id", Long.class);
        String username = claims.get("username", String.class);
        String roleString = claims.get("role", String.class);
        return new SimpleUserDetails(
                userId,
                username,
                roleString,
                null
        );
    }
}