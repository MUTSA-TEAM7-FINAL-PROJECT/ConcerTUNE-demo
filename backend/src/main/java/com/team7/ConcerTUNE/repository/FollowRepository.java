package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Follow;
import com.team7.ConcerTUNE.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    @Query("SELECT f.follower FROM Follow f WHERE f.following = :user")
    Page<User> findFollowersByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT f.following FROM Follow f WHERE f.follower = :user")
    Page<User> findFollowingByUser(@Param("user") User user, Pageable pageable);

    boolean existsByFollowerAndFollowing(User follower, User following);

    void deleteByFollowerAndFollowing(User follower, User following);
}
