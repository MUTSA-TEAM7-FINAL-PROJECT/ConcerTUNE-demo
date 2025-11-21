package com.team7.ConcerTUNE.controller;

import com.team7.ConcerTUNE.dto.NotificationDto;
import com.team7.ConcerTUNE.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    // 내 알림 목록 조회
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDto>> getMyNotifications(
            @RequestParam(defaultValue = "false") String isRead,
            Authentication authentication
    ) {
        List<NotificationDto> notifications = notificationService.getMyNotifications(authentication, isRead);
        return ResponseEntity.ok(notifications);
    }

    // 특정 알림 읽음 처리
    @PatchMapping("/{userNotificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long userNotificationId,
            Authentication authentication
    ) {
        notificationService.markAsRead(userNotificationId, authentication);
        return ResponseEntity.ok().build();
    }

    // 모든 알림 읽음 처리
    @PostMapping("/me/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication);
        return ResponseEntity.ok().build();
    }
}
