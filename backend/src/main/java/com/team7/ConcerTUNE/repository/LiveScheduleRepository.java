package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Live;
import com.team7.ConcerTUNE.entity.LiveArtist;
import com.team7.ConcerTUNE.entity.LiveSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LiveScheduleRepository extends JpaRepository<LiveSchedule, Long> {
    List<LiveSchedule> findAllByLive(Live live);

    void deleteByLive(Live live);
}
