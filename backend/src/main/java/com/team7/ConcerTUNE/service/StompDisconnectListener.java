package com.team7.ConcerTUNE.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class StompDisconnectListener {

    private final RedisChatManagerService redisChatManagerService;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");

        if (roomId != null) {
            log.info("STOMP Session Disconnected: roomId={}, sessionId={}", roomId, headerAccessor.getSessionId());

            redisChatManagerService.exitChatRoom(roomId);
        }
    }
}