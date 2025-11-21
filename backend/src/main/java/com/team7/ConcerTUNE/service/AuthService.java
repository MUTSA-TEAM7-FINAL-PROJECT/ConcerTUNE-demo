package com.team7.ConcerTUNE.service;


import com.team7.ConcerTUNE.dto.*;
import com.team7.ConcerTUNE.entity.AuthProvider;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.exception.BadRequestException;
import com.team7.ConcerTUNE.exception.ResourceNotFoundException;
import com.team7.ConcerTUNE.exception.TokenRefreshException;
import com.team7.ConcerTUNE.exception.UserAlreadyExistsException;
import com.team7.ConcerTUNE.repository.UserRepository;
import com.team7.ConcerTUNE.security.JwtService;
import com.team7.ConcerTUNE.util.RandomCodeGenerator;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RedisTemplate<String, String> stringStringRedisTemplate;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("사용자명이 이미 존재합니다");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("이메일이 이미 존재합니다");
        }

        User user = User.from(request, (passwordEncoder.encode(request.getPassword())));

        user = userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(UserDto.fromEntity(user))
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {

        String loginId = request.getLoginId();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginId,
                            request.getPassword()
                    )
            );

        } catch (AuthenticationException e) {
            System.out.println("인증 실패: " + e.getMessage());
            throw e;
        }

        User user = userRepository.findByEmail(loginId)
                .or(() -> userRepository.findByUsername(loginId))
                .orElseThrow(() -> new UsernameNotFoundException("인증 후 사용자 정보를 찾을 수 없습니다: " + loginId));

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(UserDto.fromEntity(user))
                .build();

    }

    public AuthResponse refreshToken(HttpServletRequest request) {
        String refreshToken = request.getHeader("X-Refresh-Token");
        final String email;

        try {
            email = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new TokenRefreshException(refreshToken, "유효하지 않거나 만료된 리프레시 토큰입니다.");
        }

        if (email == null) {
            throw new TokenRefreshException(refreshToken, "리프레시 토큰에 사용자 정보(이메일)가 누락되었습니다.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new TokenRefreshException(refreshToken, "토큰 정보와 일치하는 사용자를 찾을 수 없습니다."));

        if (!jwtService.isTokenValid(refreshToken, user.getUsername())) {
            throw new TokenRefreshException(refreshToken, "리프레시 토큰이 만료되었거나 서명이 유효하지 않습니다.");
        }

        if (stringStringRedisTemplate.hasKey("BL:" + refreshToken)) {
            throw new TokenRefreshException(refreshToken, "이미 무효화된 토큰입니다.");
        }

        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        Date expiration = jwtService.extractExpiration(refreshToken);
        long remainingTimeSeconds = (expiration.getTime() - System.currentTimeMillis()) / 1000;

        if (remainingTimeSeconds > 0) {
            stringStringRedisTemplate.opsForValue().set(
                    "BL:" + refreshToken,
                    "invalid",
                    remainingTimeSeconds,
                    TimeUnit.SECONDS
            );
        }

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(UserDto.fromEntity(user))
                .build();
    }

    public void logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String accessToken = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7) : null;

        String refreshToken = request.getHeader("X-Refresh-Token");

        if (accessToken == null && refreshToken == null) {
            SecurityContextHolder.clearContext();
            return;
        }

        long now = System.currentTimeMillis();

        if (accessToken != null) {
            try {
                Date accessExp = jwtService.extractExpiration(accessToken);
                long accessTtlSeconds = (accessExp.getTime() - now) / 1000;

                if (accessTtlSeconds > 0) {
                    stringStringRedisTemplate.opsForValue().set(
                            "BL:" + accessToken,
                            "logout",
                            accessTtlSeconds,
                            TimeUnit.SECONDS
                    );
                }
            } catch (Exception e) {
            }
        }

        if (refreshToken != null) {
            try {
                Date refreshExp = jwtService.extractExpiration(refreshToken);
                long refreshTtlSeconds = (refreshExp.getTime() - now) / 1000;

                if (refreshTtlSeconds > 0) {
                    stringStringRedisTemplate.opsForValue().set(
                            "BL:" + refreshToken,
                            "logout",
                            refreshTtlSeconds,
                            TimeUnit.SECONDS
                    );
                }
            } catch (Exception e) {
            }
        }
        SecurityContextHolder.clearContext();
    }

    public void requestEmailVerification(EmailVerifyRequest request) {
        String verificationCode = RandomCodeGenerator.generateRandomCode(6);


        String redisKey = "EmailVerify:" + request.getEmail();
        long expirationMinutes = 3;

        stringStringRedisTemplate.opsForValue().set(
                redisKey,
                verificationCode,
                expirationMinutes,
                TimeUnit.MINUTES
        );

        emailService.sendVerificationEmail(request.getEmail(), verificationCode);
    }

    public void confirmEmailVerification(VerifyConfirmRequest request) {
        String redisKey = "EmailVerify:" + request.getEmail();

        String storedCode = stringStringRedisTemplate.opsForValue().get(redisKey);

        if (storedCode == null) {
            throw new BadRequestException("인증 코드가 만료되었거나 유효하지 않습니다.");
        }

        if (!storedCode.equals(request.getToken())) {
            throw new BadRequestException("인증 코드가 일치하지 않습니다.");
        }

        stringStringRedisTemplate.delete(redisKey);
    }

    public void requestPasswordForget(PasswordForgetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("해당 이메일의 사용자를 찾을 수 없습니다: " + request.getEmail()));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException("소셜 계정은 비밀번호를 바꿀 수 없습니다.");
        }

        String resetToken = RandomCodeGenerator.generateRandomCode(12);
        String redisKey = "PasswordReset:" + resetToken;
        long expirationMinutes = 10;

        stringStringRedisTemplate.opsForValue().set(
                redisKey,
                user.getEmail(),
                expirationMinutes,
                TimeUnit.MINUTES
        );

        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    public void resetPassword(PasswordResetRequest request) {
        String resetToken = request.getToken();
        String redisKey = "PasswordReset:" + resetToken;

        String userEmail = stringStringRedisTemplate.opsForValue().get(redisKey);

        if (userEmail == null) {
            throw new BadRequestException("재설정 토큰이 만료되었거나 유효하지 않습니다.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("토큰과 일치하는 사용자를 찾을 수 없습니다."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        stringStringRedisTemplate.delete(redisKey);
    }
}