package com.team7.ConcerTUNE.dto;

import com.team7.ConcerTUNE.entity.ChatMessage;

import java.util.List;

public class ChatHistoryResponse {
    private final List<ChatMessage> messages;
    private final boolean hasMore;

    public ChatHistoryResponse(List<ChatMessage> messages, boolean hasMore) {
        this.messages = messages;
        this.hasMore = hasMore;
    }

    public List<ChatMessage> getMessages() { return messages; }
    public boolean isHasMore() { return hasMore; }
}