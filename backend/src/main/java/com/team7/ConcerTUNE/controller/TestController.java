package com.team7.ConcerTUNE.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private String getCurrentUserName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "Anonymous";
    }

    // --- 1. ID 일치 (User ID vs Path Variable ID) ---

    /**
     * @PreAuthorize("authentication.principal.email == #targetId")
     * 현재 로그인한 사용자의 이메일과 URL 경로의 ID가 일치할 때만 접근 허용
     * URL 예: /api/test/id/user@example.com
     */
    @GetMapping("/id/{targetId}")
    @PreAuthorize("authentication.name == #targetId")
    public ResponseEntity<String> checkUserIdMatch(@PathVariable String targetId) {
        String username = getCurrentUserName();
        log.info("✅ GET /id/{} - 접근 성공 (사용자: {}). ID 일치 검사 통과.", targetId, username);
        return ResponseEntity.ok("ID 일치 검사 성공. 사용자: " + username);
    }

    // --- 2. 역할 기반 권한 검사 ---

    /**
     * @PreAuthorize("hasRole('USER')")
     * USER 권한만 접근 가능 (GET 요청)
     */
    @GetMapping("/role/user-only")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> userOnlyGetTest() {
        String email = getCurrentUserName();
        log.info("✅ GET /role/user-only - 접근 성공 (사용자: {}). ROLE_USER 필요.", email);
        return ResponseEntity.ok("USER 역할 접근 테스트 성공.");
    }

    /**
     * @PreAuthorize("hasRole('USER')")
     * USER 권한만 접근 가능 (POST 요청, 일반적인 User 권한 테스트)
     */
    @PostMapping("/role/user-post")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> userOnlyPostTest() {
        String username = getCurrentUserName();
        log.info("✅ POST /role/user-post - 접근 성공 (사용자: {}). ROLE_USER 필요.", username);
        return ResponseEntity.ok("USER 역할 POST 테스트 성공.");
    }

    /**
     * @PreAuthorize("hasRole('ADMIN')")
     * ADMIN 권한만 접근 가능 (POST 요청)
     */
    @PostMapping("/role/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminOnlyPostTest() {
        String username = getCurrentUserName();
        log.info("✅ POST /role/admin-only - 접근 성공 (사용자: {}). ROLE_ADMIN 필요.", username);
        return ResponseEntity.ok("ADMIN 역할 접근 테스트 성공.");
    }

    /**
     * @PreAuthorize("hasRole('ARTIST')")
     * ARTIST 권한만 접근 가능 (GET 요청)
     */
    @GetMapping("/role/artist-only")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<String> artistOnlyGetTest() {
        String username = getCurrentUserName();
        log.info("✅ GET /role/artist-only - 접근 성공 (사용자: {}). ROLE_ARTIST 필요.", username);
        return ResponseEntity.ok("ARTIST 역할 접근 테스트 성공.");
    }

    // --- 3. 다중 역할 검사 (OR 조건) ---

    /**
     * @PreAuthorize("hasAnyRole('ADMIN', 'ARTIST')")
     * ADMIN 또는 ARTIST 권한 중 하나만 있어도 접근 가능
     */
    @GetMapping("/role/admin-or-artist")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTIST')")
    public ResponseEntity<String> adminOrArtistGetTest() {
        String username = getCurrentUserName();
        log.info("✅ GET /role/admin-or-artist - 접근 성공 (사용자: {}). ADMIN 또는 ARTIST 필요.", username);
        return ResponseEntity.ok("ADMIN 또는 ARTIST 역할 접근 테스트 성공.");
    }
}