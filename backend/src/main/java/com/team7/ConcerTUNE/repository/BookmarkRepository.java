package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Bookmark;
import com.team7.ConcerTUNE.entity.Live;
import com.team7.ConcerTUNE.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    boolean existsByUserAndLive(User user, Live live);

    @Query("SELECT b.live FROM Bookmark b WHERE b.user = :user")
    Page<Live> findBookmarkedLivesByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT COUNT(b) FROM Bookmark b WHERE b.live.id = :liveId")
    int countByLiveId(@Param("liveId") Long liveId);

    void deleteByUserAndLive(User user, Live live);
}
