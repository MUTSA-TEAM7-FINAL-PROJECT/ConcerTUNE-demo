package com.team7.ConcerTUNE.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RedisChatManagerService {

    private final RedisMessageListenerContainer redisMessageListenerContainer;
    private final MessageListenerAdapter listenerAdapter;

    private final Map<String, ChannelTopic> topics = new ConcurrentHashMap<>();
    private final Map<String, Integer> chatRoomUserCount = new ConcurrentHashMap<>();

    private ChannelTopic getTopic(String roomId) {
        return new ChannelTopic("chat:room:" + roomId);
    }

    public void enterChatRoom(String roomId) {

        chatRoomUserCount.merge(roomId, 1, Integer::sum);

        if (chatRoomUserCount.get(roomId) == 1 && !topics.containsKey(roomId)) {
            ChannelTopic topic = getTopic(roomId);

            redisMessageListenerContainer.addMessageListener(listenerAdapter, topic);
            topics.put(roomId, topic);
        }
    }

    public void exitChatRoom(String roomId) {

        Integer currentCount = chatRoomUserCount.computeIfPresent(roomId, (k, v) -> v > 0 ? v - 1 : 0);

        if (currentCount != null && currentCount == 0 && topics.containsKey(roomId)) {
            ChannelTopic topic = topics.get(roomId);

            redisMessageListenerContainer.removeMessageListener(listenerAdapter, topic);
            topics.remove(roomId);
            chatRoomUserCount.remove(roomId);
        }
    }
}