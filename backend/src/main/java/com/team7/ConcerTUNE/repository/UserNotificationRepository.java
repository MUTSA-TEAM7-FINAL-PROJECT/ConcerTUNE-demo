package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    // 특정 유저 알림 조회
    @Query("SELECT un FROM UserNotification un JOIN FETCH un.notification n " +
    "WHERE un.user = :user AND un.isRead = :isRead " +
    "ORDER BY n.createdAt DESC")
    List<UserNotification> findByUserAndIsReadSorted(User user, boolean isRead);

    // 특정 유저의 모든 안 읽은 알림 조회
    List<UserNotification> findAllByUserAndIsRead(User suer, boolean isRead);
}
