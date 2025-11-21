package com.team7.ConcerTUNE.dto;

import com.team7.ConcerTUNE.entity.Live;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveSummaryResponse {

    private Long id;
    private String title;
    private String posterUrl;
    private String ticketUrl;
    private LocalDateTime ticketDateTime;

    private List<ArtistSummaryDto> artists;
    private List<LiveScheduleDto> schedules;

    private int countBookmark;
    private Boolean isBookmarked;

    // 비로그인
    public static LiveSummaryResponse fromEntity(Live entity) {
        return LiveSummaryResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .posterUrl(entity.getPosterUrl())
                .ticketUrl(entity.getTicketUrl())
                .ticketDateTime(entity.getTicketDateTime())
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
                .countBookmark(entity.getBookmarks().size())
                .build();
    }

//    // 로그인
//    public static LiveSummaryResponse fromEntity(
//            Live entity,
//            List<ArtistSummaryDto> artists,
//            List<ScheduleDto> schedules,
//            int countBookmark,
//            Boolean isBookmarked
//    ) {
//        return LiveSummaryResponse.builder()
//                .id(entity.getId())
//                .title(entity.getTitle())
//                .posterUrl(entity.getPosterUrl())
//                .ticketUrl(entity.getTicketUrl())
//                .ticketDateTime(entity.getTicketDateTime())
//                .artists(artists)
//                .schedules(schedules)
//                .countBookmark(countBookmark)
//                .isBookmarked(isBookmarked)
//                .build();
//    }
}
