package com.team7.ConcerTUNE.controller;

import com.team7.ConcerTUNE.dto.ChatMessageDto;
import com.team7.ConcerTUNE.service.ChatService;
import com.team7.ConcerTUNE.service.RedisChatManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChatService chatService;
    private final RedisChatManagerService redisChatManagerService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessage) {
        chatService.sendMessage(chatMessage);
    }

    @MessageMapping("/chat.addUser/{roomId}")
    public void addUser(
            @DestinationVariable String roomId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        redisChatManagerService.enterChatRoom(roomId);
        headerAccessor.getSessionAttributes().put("roomId", roomId);
    }
}