package com.team7.ConcerTUNE.controller;


import com.team7.ConcerTUNE.dto.*;
import com.team7.ConcerTUNE.repository.UserRepository;
import com.team7.ConcerTUNE.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
                @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(
            @Valid @RequestBody AuthRequest request
    ) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(HttpServletRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/email/verify/request")
    public ResponseEntity<Void> requestEmailVerification(
            @Valid @RequestBody EmailVerifyRequest request
    ) {
        authService.requestEmailVerification(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/verify/confirm")
    public ResponseEntity<Void> confirmEmailVerification(
            @Valid @RequestBody VerifyConfirmRequest request
    ) {
        authService.confirmEmailVerification(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password/forget")
    public ResponseEntity<Void> requestPasswordForget(
            @Valid @RequestBody PasswordForgetRequest request
    ) {
        authService.requestPasswordForget(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password/reset")
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody PasswordResetRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }


}