package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Artist;
import com.team7.ConcerTUNE.entity.Live;
import com.team7.ConcerTUNE.entity.LiveArtist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LiveArtistRepository extends JpaRepository<LiveArtist, Long> {

    List<LiveArtist> findAllByLiveId(Long liveId); // LiveArtist 엔티티 반환

    void deleteByLive(Live live);
}
