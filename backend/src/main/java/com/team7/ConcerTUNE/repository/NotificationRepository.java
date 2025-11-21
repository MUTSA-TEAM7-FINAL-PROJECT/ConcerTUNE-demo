package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
