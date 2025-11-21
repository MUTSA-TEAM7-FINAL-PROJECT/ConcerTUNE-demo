package com.team7.ConcerTUNE.service;

import com.team7.ConcerTUNE.dto.ChatHistoryResponse;
import com.team7.ConcerTUNE.dto.ChatMessageDto;
import com.team7.ConcerTUNE.entity.*;
import com.team7.ConcerTUNE.exception.ResourceNotFoundException;
import com.team7.ConcerTUNE.exception.UserNotFoundException;
import com.team7.ConcerTUNE.repository.ArtistManagerRepository;
import com.team7.ConcerTUNE.repository.ChatMessageRepository;
import com.team7.ConcerTUNE.repository.LiveRepository;
import com.team7.ConcerTUNE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final UserRepository userRepository;
    private final LiveRepository livesRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ArtistManagerRepository artistManagerRepository;
    private final RedisPublisher redisPublisher;

    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto messageDto) {

        User sender = userRepository.findById(Long.valueOf(messageDto.getUserId()))
                .orElseThrow(() -> new UserNotFoundException("메시지 발신자 정보가 존재하지 않습니다."));

        if (messageDto.getTargetUserId() != null) {
            userRepository.findById(Long.valueOf(messageDto.getTargetUserId()))
                    .orElseThrow(() -> new UserNotFoundException("태그 대상 유저 정보가 존재하지 않습니다."));
        }

        Live live = livesRepository.findById(Long.valueOf(messageDto.getRoomId()))
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 공연(채팅방)입니다."));

        MessageInfo messageInfo = determineMessageInfo(sender, live, messageDto);

        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(messageDto.getRoomId())
                .userId(messageDto.getUserId())
                .sender(messageInfo.getNickname())
                .targetUserId(messageDto.getTargetUserId())
                .message(messageDto.getMessage())
                .type(messageInfo.getType())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        ChatMessageDto savedDto = convertToDto(savedMessage);

        redisPublisher.publish(savedDto);

        return savedDto;
    }

    public ChatHistoryResponse getHistory(String roomId, int page, int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ChatMessage> chatPage = chatMessageRepository.findByRoomId(roomId, pageRequest);
        List<ChatMessage> orderedMessages = chatPage.getContent();

        return new ChatHistoryResponse(
                orderedMessages,
                !chatPage.isLast()
        );
    }

    private ChatMessageDto convertToDto(ChatMessage entity) {
        return ChatMessageDto.builder()
                .id(entity.getId())
                .roomId(entity.getRoomId())
                .sender(entity.getSender())
                .userId(entity.getUserId())
                .targetUserId(entity.getTargetUserId())
                .message(entity.getMessage())
                .type(entity.getType())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private MessageInfo determineMessageInfo(User sender, Live live, ChatMessageDto messageDto) {

        if (sender.getAuth() == AuthRole.ADMIN) {
            return new MessageInfo("운영자", ChatMessageDto.MessageType.ADMIN);
        }

        List<Artist> artists = live.getLiveArtists().stream()
                .map(LiveArtist::getArtist)
                .toList();

        for (Artist artist : artists) {
            Optional<ArtistManager> managerOpt = artistManagerRepository
                    .findByIdUserIdAndIdArtistId(sender.getId(), artist.getArtistId());

            if (managerOpt.isPresent()) {
                ArtistManager manager = managerOpt.get();

                // 1. 공식 관리자 (isOfficial=true)인 경우
                if (manager.isOfficial()) {
                    String nickname = artist.getArtistName() + " (Official)";
                    return new MessageInfo(nickname, ChatMessageDto.MessageType.ARTIST_OFFICIAL);
                }

                // 2. 비공식 관리자 (isOfficial=false)인 경우
                else {
                    String nickname = sender.getUsername() + " (팬 매니저)";
                    return new MessageInfo(nickname, ChatMessageDto.MessageType.ARTIST_FAN_MANAGER);
                }
            }
        }

        return new MessageInfo(sender.getUsername(), ChatMessageDto.MessageType.NORMAL);
    }

    private static class MessageInfo {
        private final String nickname;
        private final ChatMessageDto.MessageType type;

        public MessageInfo(String nickname, ChatMessageDto.MessageType type) {
            this.nickname = nickname;
            this.type = type;
        }

        public String getNickname() { return nickname; }
        public ChatMessageDto.MessageType getType() { return type; }
    }

}