package com.team7.ConcerTUNE.service;

import com.team7.ConcerTUNE.dto.ArtistSummaryDto;
import com.team7.ConcerTUNE.dto.LiveResponse;
import com.team7.ConcerTUNE.dto.LiveSummaryResponse;
import com.team7.ConcerTUNE.entity.*;
import com.team7.ConcerTUNE.exception.ResourceNotFoundException;
import com.team7.ConcerTUNE.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LiveService {
    private final LiveRepository liveRepository;
    private final BookmarkRepository bookmarkRepository;
    private final ArtistRepository artistRepository;
    private final LiveArtistRepository liveArtistRepository;

    // 공연 전체 조회
    @Transactional(readOnly = true)
    public Page<LiveSummaryResponse> getAllLives(Pageable pageable, User user) {
        Page<Live> lives = liveRepository.findAll(pageable);

        return lives.map(live -> {
            LiveSummaryResponse response = LiveSummaryResponse.fromEntity(live);

            boolean isBookmarked = false;
            if (user != null) {
                isBookmarked = bookmarkRepository.existsByUserAndLive(user, live);
            }
            response.setIsBookmarked(isBookmarked);

            return response;
        });
    }

    // 공연 단일 조회
    @Transactional(readOnly = true)
    public LiveResponse getLive(Long liveId, User user) {
        Live live = liveRepository.findById(liveId)
                .orElseThrow(() -> new ResourceNotFoundException("공연을 찾을 수 없습니다. ID: " + liveId));

        LiveResponse response = LiveResponse.fromEntity(live);

        boolean isBookmarked = false;
        if (user != null) {
            isBookmarked = bookmarkRepository.existsByUserAndLive(user, live);
        }
        response.setIsBookmarked(isBookmarked);

        return response;
    }

    // 아티스트 조회
    @Transactional(readOnly = true)
    public List<ArtistSummaryDto> getArtists(Long liveId) {
        List<LiveArtist> liveArtists = liveArtistRepository.findAllByLiveId(liveId);

        return liveArtists.stream()
                .map(LiveArtist::getArtist)
                .map(ArtistSummaryDto::fromEntity)
                .toList();
    }

}

