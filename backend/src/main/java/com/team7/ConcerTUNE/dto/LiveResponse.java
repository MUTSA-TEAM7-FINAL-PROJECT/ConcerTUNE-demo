package com.team7.ConcerTUNE.dto;

import com.team7.ConcerTUNE.entity.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveResponse {

    private Long liveId;

    private String title;

    private String description;

    private String posterUrl;

    private String ticketUrl;

    private String venue;

    private Map<String, Integer> price;

    private String writerName;

    private Long writerId;

    private List<ArtistSummaryDto> artists;

    private List<LiveScheduleDto> schedules;

    private LocalDateTime ticketDateTime;

    private RequestStatus requestStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private int countBookmark;

    private Boolean isBookmarked;



    // 비로그인
    public static LiveResponse fromEntity(Live entity) {

        LiveResponse liveResponse = LiveResponse.builder()
                .liveId(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .posterUrl(entity.getPosterUrl())
                .ticketUrl(entity.getTicketUrl())
                .ticketDateTime(entity.getTicketDateTime())
                .venue(entity.getVenue())
                .price(entity.getPrice())
                .writerName(entity.getWriter().getUsername())
                .writerId(entity.getWriter().getId())
                .artists(
                        entity.getLiveArtists().stream()
                                .map(liveArtist ->
                                        ArtistSummaryDto.fromEntity(liveArtist.getArtist()))
                                .toList()
                )
                .schedules(
                        entity.getLiveSchedules().stream()
                                .map(liveSchedule ->
                                        LiveScheduleDto.fromEntity(liveSchedule.getSchedule())
                                )
                                .toList()
                )
                .requestStatus(entity.getRequestStatus())
                .countBookmark(0)
                .build();

        if (entity.getBookmarks() != null) {
            liveResponse.setCountBookmark(entity.getBookmarks().size());
        }

        return liveResponse;
    }
    
//    // 로그인
//    public static LiveResponse fromEntity(Live entity, User user) {
//        return LiveResponse.builder()
//                .id(entity.getId())
//                .title(entity.getTitle())
//                .description(entity.getDescription())
//                .posterUrl(entity.getPosterUrl())
//                .ticketUrl(entity.getTicketUrl())
//                .ticketDateTime(entity.getTicketDateTime())
//                .venue(entity.getVenue())
//                .price(entity.getPrice())
//                .artists(
//                        entity.getLiveArtists().stream()
//                                .map(liveArtist ->
//                                        ArtistSummaryDto.fromEntity(liveArtist.getArtist()))
//                                .toList()
//                )
//                .schedules(
//                        entity.getLiveSchedules().stream()
//                                .map(liveSchedule ->
//                                        ScheduleDto.fromEntity(liveSchedule.getSchedule())
//                                )
//                                .toList()
//                )
//                .countBookmark
//                .build();
//    }
}
