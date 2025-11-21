package com.team7.ConcerTUNE.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team7.ConcerTUNE.dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisSubscriber implements MessageListener {
    private final ObjectMapper objectMapper;
    private final SimpMessageSendingOperations messagingTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String publishMessage = new String(message.getBody());
            ChatMessageDto chatMessage = objectMapper.readValue(publishMessage, ChatMessageDto.class);
            String destination = "/topic/chat/room/" + chatMessage.getRoomId();
            messagingTemplate.convertAndSend(destination, chatMessage);
        } catch (Exception e) {
            log.error("Error processing message", e);
        }
    }
}