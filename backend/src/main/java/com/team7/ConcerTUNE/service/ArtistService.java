package com.team7.ConcerTUNE.service;

import com.team7.ConcerTUNE.dto.ArtistDetailDto;
import com.team7.ConcerTUNE.dto.ArtistSummaryDto;
import com.team7.ConcerTUNE.entity.*;
import com.team7.ConcerTUNE.exception.BadRequestException;
import com.team7.ConcerTUNE.exception.ResourceNotFoundException;
import com.team7.ConcerTUNE.repository.ArtistRepository;
import com.team7.ConcerTUNE.repository.UserArtistRepository;
import com.team7.ConcerTUNE.repository.UserRepository;
import com.team7.ConcerTUNE.security.SimpleUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class ArtistService {
    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;
    private final UserArtistRepository userArtistRepository;
    private final NotificationService notificationService;

    // 아티스트 목록 조회
    @Transactional(readOnly = true)
    public Page<ArtistSummaryDto> getArtistList(String name, Pageable pageable) {
        Page<Artist> artistPage;
        if (StringUtils.hasText(name)) {
            artistPage = artistRepository.findByArtistNameContainingIgnoreCase(name, pageable);
        } else {
            artistPage = artistRepository.findAll(pageable);
        }

        return artistPage.map(artist -> {
            long followerCount = userArtistRepository.countByArtist(artist);
            return ArtistSummaryDto.fromEntity(artist, followerCount);
        });
    }

    // 아티스트 상세 정보 조회
    @Transactional(readOnly = true)
    public ArtistDetailDto getArtistById(Long artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("아티스트를 찾을 수 없습니다"));
        long followerCount = userArtistRepository.countByArtist(artist);
        return ArtistDetailDto.fromEntity(artist, followerCount);
    }

    // 아티스트 팔로우
    @Transactional
    public void followArtist(Long artistId, Authentication authentication) {
        User user = getUserFromAuth(authentication);
        Artist artist = findArtistById(artistId);

        if (userArtistRepository.existsByUserAndArtist(user, artist)) {
            throw new BadRequestException("이미 팔로우한 아티스트입니다");
        }

        UserArtist follow = UserArtist.builder()
                .user(user)
                .artist(artist)
                .build();
        userArtistRepository.save(follow);
    }

    // 아티스트 언팔로우
    @Transactional
    public void unfollowArtist(Long artistId, Authentication authentication) {
        User user = getUserFromAuth(authentication);
        Artist artist = findArtistById(artistId);
        UserArtist follow = userArtistRepository.findByUserAndArtist(user, artist)
                .orElseThrow(() -> new ResourceNotFoundException("팔로우 관계를 찾을 수 없습니다"));
        userArtistRepository.delete(follow);
    }

    /* 아티스트 권한 유저의 공연 등록 요청
    @Transactional
    public void requestLiveConcert(LiveRequestDto requestDto, Authentication authentication) {
        User managerUser = getUserFromAuth(authentication);
        Artist artist = artistRepository.findByManager(managerUser)
                .orElseThrow(() -> new AccessDeniedException("공연을 등록할 아티스트 권한이 없거나 매핑된 아티스트가 없습니다"));

        LiveRequest request = LiveRequest.builder()
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .posterUrl(requestDto.getPosterUrl())
                .ticketUrl(requestDto.getTicketUrl())
                .venue(requestDto.getVenue())
                .price(requestDto.getPrice())
                .artist(artist)
                .requestStatus(RequestStatus.PENDING)
                .build();
        liveRequestRepository.save(request);

        String content = artist.getArtistName() + "의 새 공연 등록 요청이 있습니다.";
        String link = "/admin/requests/" + request.getRequestId();
        notificationService.createNotificationForAdmins(content, link);
    } */

    // 유틸리티 메서드 - 중복 코드 방지
    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SimpleUserDetails)) {
            throw new BadRequestException("유효한 로그인 정보가 없습니다");
        }
        SimpleUserDetails userDetails = (SimpleUserDetails) authentication.getPrincipal();
        return userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("유저를 찾을 수 없습니다. ID: " + userDetails.getUserId()));
    }

    private Artist findArtistById(Long artistId) {
        return artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("아티스트를 찾을 수 없습니다. ID: " + artistId));
    }
}
