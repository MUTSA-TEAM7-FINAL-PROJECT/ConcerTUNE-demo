package com.team7.ConcerTUNE.controller;

import com.team7.ConcerTUNE.dto.ChatHistoryResponse;
import com.team7.ConcerTUNE.dto.ChatMessageDto;
import com.team7.ConcerTUNE.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/history/{roomId}")
    public ResponseEntity<ChatHistoryResponse> getChatHistory(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        ChatHistoryResponse response = chatService.getHistory(roomId, page, size);
        return ResponseEntity.ok(response);
    }
}