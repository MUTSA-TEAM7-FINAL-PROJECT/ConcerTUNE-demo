package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Artist;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.entity.UserArtist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserArtistRepository extends JpaRepository<UserArtist, UserArtist> {
    // 유저가 특정 아티스트 팔로우했는지 확인
    boolean existsByUserAndArtist(User user, Artist artist);

    // 팔로우 관계 조회
    Optional<UserArtist> findByUserAndArtist(User user, Artist artist);

    // 특정 아티스트를 팔로우하는 모든 UserArtist 관계 조회 (팔로워 목록)
    List<UserArtist> findAllByArtist(Artist artist);

    // 특정 아티스트의 팔로워 수 카운트
    long countByArtist(Artist artist);

}
