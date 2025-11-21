package com.team7.ConcerTUNE.service;

import com.team7.ConcerTUNE.dto.LiveRequest;
import com.team7.ConcerTUNE.dto.LiveResponse;
import com.team7.ConcerTUNE.entity.*;
import com.team7.ConcerTUNE.exception.BadRequestException;
import com.team7.ConcerTUNE.exception.ResourceNotFoundException;
import com.team7.ConcerTUNE.repository.*;
import com.team7.ConcerTUNE.security.SimpleUserDetails;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LiveRequestService {
    private final LiveRequestRepository liveRequestRepository;
    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;
    private final LiveRepository liveRepository;
    private final ScheduleRepository scheduleRepository;
    private final LiveArtistRepository liveArtistRepository;
    private final LiveScheduleRepository liveScheduleRepository;

    // 요청 등록
    public LiveResponse createRequest(LiveRequest request, User user) {
        Live live = Live.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .posterUrl(request.getPosterUrl())
                .ticketUrl(request.getTicketUrl())
                .venue(request.getVenue())
                .price(request.getPrice())
                .ticketDateTime(request.getTicketDateTime())
                .writer(user)
                .build();

        Live saved = liveRepository.save(live);
        return LiveResponse.fromEntity(saved);
    }

    // 요청 목록 반환
    public Page<LiveResponse> getAllRequests(Pageable pageable) {
        Page<Live> liveRequests = liveRepository.findAllByRequestStatus(RequestStatus.PENDING, pageable);
        return liveRequests.map(LiveResponse::fromEntity);
    }

    // 요청 개별 반환
    public LiveResponse getLiveRequest(Long liveRequestId) {
        Live live = liveRequestRepository.findById(liveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("요청을 찾을 수 없습니다. ID: " + liveRequestId));

        return LiveResponse.fromEntity(live);
    }

    // 요청 승인 및 공연 등록
    public void approveRequest(Long liveRequestId) {
        Live liveRequest = liveRequestRepository.findById(liveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("요청을 찾을 수 없습니다. ID: " + liveRequestId));

        liveRequest.changeStatus(RequestStatus.APPROVED);

        // 공연 등록
        Live live = Live.builder()
                .title(liveRequest.getTitle())
                .description(liveRequest.getDescription())
                .posterUrl(liveRequest.getPosterUrl())
                .ticketUrl(liveRequest.getTicketUrl())
                .ticketDateTime(liveRequest.getTicketDateTime())
                .venue(liveRequest.getVenue())
                .price(liveRequest.getPrice())
                .writer(liveRequest.getWriter())
                .build();

        liveRepository.save(live);

        if (liveRequest.getLiveArtists() != null && !liveRequest.getLiveArtists().isEmpty()) {
            List<LiveArtist>newLinks = liveRequest.getLiveArtists().stream()
                    .map(requestLink -> LiveArtist.builder()
                            .live(live)
                            .artist(requestLink.getArtist())
                            .build())
                    .toList();

            liveArtistRepository.saveAll(newLinks);
            live.setLiveArtists(newLinks);
        }

        if (liveRequest.getLiveSchedules() != null && !liveRequest.getLiveSchedules().isEmpty()) {
            List<LiveSchedule> newSchedules = liveRequest.getLiveSchedules().stream()
                    .map(requestSchedule -> LiveSchedule.builder()
                            .live(live)
                            .schedule(requestSchedule.getSchedule())
                            .build())
                    .toList();

            liveScheduleRepository.saveAll(newSchedules);
            live.setLiveSchedules(newSchedules);
        }

        liveRequestRepository.save(liveRequest);
    }

    public LiveResponse modifyLive(Long targetLiveId, LiveRequest liveRequest) {
        Live targetLive = liveRepository.findById(targetLiveId)
                .orElseThrow(() -> new ResourceNotFoundException("공연을 찾을 수 없습니다. ID: " + targetLiveId));

        targetLive.setTitle(liveRequest.getTitle());
        targetLive.setDescription(liveRequest.getDescription());
        targetLive.setPosterUrl(liveRequest.getPosterUrl());
        targetLive.setTicketUrl(liveRequest.getTicketUrl());
        targetLive.setVenue(liveRequest.getVenue());
        targetLive.setPrice(liveRequest.getPrice());
        targetLive.setTicketDateTime(liveRequest.getTicketDateTime());

        if (liveRequest.getArtistIds() != null) {
            liveArtistRepository.deleteByLive(targetLive);

            List<Artist> artists = artistRepository.findAllById(liveRequest.getArtistIds());

            List<LiveArtist> links = artists.stream()
                    .map(artist -> LiveArtist.builder()
                            .live(targetLive)
                            .artist(artist)
                            .build())
                    .toList();

            liveArtistRepository.saveAll(links);
            targetLive.getLiveArtists().clear();
            targetLive.getLiveArtists().addAll(links);
        }

        if (liveRequest.getScheduleIds() != null) {
            liveScheduleRepository.deleteByLive(targetLive);

            List<Schedule> schedules = scheduleRepository.findAllById(liveRequest.getScheduleIds());

            List<LiveSchedule> liveSchedules = schedules.stream()
                    .map(schedule -> LiveSchedule.builder()
                            .live(targetLive)
                            .schedule(schedule)
                            .build())
                    .toList();

            liveScheduleRepository.saveAll(liveSchedules);
            targetLive.getLiveSchedules().clear();
            targetLive.getLiveSchedules().addAll(liveSchedules);
        }
        return LiveResponse.fromEntity(targetLive);
    }

    // 편의 메서드
    private User getAdminFromAuth(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SimpleUserDetails)) {
            throw new BadRequestException("유효한 로그인 정보가 없습니다. (Auth is null or not SimpleUserDetails)");
        }
        SimpleUserDetails userDetails = (SimpleUserDetails) authentication.getPrincipal();

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new BadRequestException("관리자만 접근할 수 있는 기능입니다.");
        }

        return userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "인증 정보에 해당하는 유저를 찾을 수 없습니다. ID: " + userDetails.getUserId()
                ));
    }
}
