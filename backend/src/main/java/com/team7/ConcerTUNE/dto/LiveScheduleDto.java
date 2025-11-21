package com.team7.ConcerTUNE.dto;

import com.team7.ConcerTUNE.entity.Schedule;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveScheduleDto {

    private Long scheduleId;
    private LocalDate liveDate;
    private LocalTime liveStartTime;

    public static LiveScheduleDto fromEntity(Schedule schedule) {
        return LiveScheduleDto.builder()
                .scheduleId(schedule.getId())
                .liveDate(schedule.getLiveDate())
                .liveStartTime(schedule.getLiveTime())
                .build();
    }
}
