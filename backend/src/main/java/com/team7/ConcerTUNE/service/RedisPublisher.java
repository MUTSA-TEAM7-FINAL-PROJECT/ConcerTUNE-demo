package com.team7.ConcerTUNE.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team7.ConcerTUNE.dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisPublisher {
    private final RedisTemplate<String, Object> stringObjectRedisTemplate;
    private final ObjectMapper objectMapper;

    public void publish(ChatMessageDto message) {
        try {
            String topicName = "chat:room:" + message.getRoomId();
            String jsonMessage = objectMapper.writeValueAsString(message);
            stringObjectRedisTemplate.convertAndSend(topicName, jsonMessage);
        } catch (Exception e) {
            log.error("Error publishing message to Redis", e);
        }
    }
}