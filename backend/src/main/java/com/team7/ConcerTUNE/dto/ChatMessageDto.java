package com.team7.ConcerTUNE.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private String roomId;
    private String sender;
    private String userId;
    private String targetUserId;
    private String message;
    private MessageType type;
    private LocalDateTime createdAt;

    public enum MessageType {
        NORMAL,
        ARTIST_OFFICIAL,
        ARTIST_FAN_MANAGER,
        ADMIN
    }
}