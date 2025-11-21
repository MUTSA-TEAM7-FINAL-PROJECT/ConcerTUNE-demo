package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByRoomId(String roomId, Pageable pageable);
}