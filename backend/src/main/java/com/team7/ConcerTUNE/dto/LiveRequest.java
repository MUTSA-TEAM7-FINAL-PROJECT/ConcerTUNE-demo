package com.team7.ConcerTUNE.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveRequest {
    private String title;
    private String description;
    private String posterUrl;
    private String ticketUrl;
    private String venue;
    private Map<String, Integer> price;
    private LocalDateTime ticketDateTime;
    private List<Long> artistIds;
    private List<Long> scheduleIds;
}
