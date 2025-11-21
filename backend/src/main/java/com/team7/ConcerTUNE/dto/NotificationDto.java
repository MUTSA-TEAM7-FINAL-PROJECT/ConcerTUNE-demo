package com.team7.ConcerTUNE.dto;

import com.team7.ConcerTUNE.entity.Notification;
import com.team7.ConcerTUNE.entity.UserNotification;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String content;
    private String link;
    private LocalDateTime createAt;
    private boolean isRead;
    public static NotificationDto fromEntity(UserNotification userNotification) {
        Notification notification = userNotification.getNotification();

        return NotificationDto.builder()
                .id(userNotification.getId())
                .content(notification.getContent())
                .link(notification.getLink())
                .isRead(userNotification.isRead())
                .createAt(notification.getCreatedAt())
                .build();
    }
}
