package com.team7.ConcerTUNE.service;

import com.team7.ConcerTUNE.dto.NotificationDto;
import com.team7.ConcerTUNE.entity.*;
import com.team7.ConcerTUNE.exception.BadRequestException;
import com.team7.ConcerTUNE.exception.ResourceNotFoundException;
import com.team7.ConcerTUNE.repository.NotificationRepository;
import com.team7.ConcerTUNE.repository.UserArtistRepository;
import com.team7.ConcerTUNE.repository.UserNotificationRepository;
import com.team7.ConcerTUNE.repository.UserRepository;
import com.team7.ConcerTUNE.security.SimpleUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;
    private final UserArtistRepository userArtistRepository;

    // 내 알림 목록 조회
    @Transactional(readOnly = true)
    public List<NotificationDto> getMyNotifications(Authentication authentication, String isReadParam) {
        User user = getUserFromAuth(authentication);
        List<UserNotification> userNotifs;
        if ("true".equalsIgnoreCase(isReadParam)) {
            // 읽은 알림 조회
            userNotifs = userNotificationRepository.findByUserAndIsReadSorted(user, true);
        } else if ("all".equalsIgnoreCase(isReadParam)) {
            // 모든 알림 조회
            List<UserNotification> unread = userNotificationRepository.findByUserAndIsReadSorted(user, false);
            List<UserNotification> read = userNotificationRepository.findAllByUserAndIsRead(user, true);
            unread.addAll(read); // 안 읽은 알림이 위로 오도록 함
            userNotifs = unread;
        } else {
            // 기본값 - 안 읽은 알림 조회
            userNotifs = userNotificationRepository.findByUserAndIsReadSorted(user, false);
        }
        return userNotifs.stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 특정 알림 읽음 처리
    public void markAsRead(Long userNotificationId, Authentication authentication) {
        User user = getUserFromAuth(authentication);
        UserNotification userNotif = userNotificationRepository.findById(userNotificationId)
                .orElseThrow(() -> new ResourceNotFoundException("알림을 찾을 수 없습니다. ID: " + userNotificationId));
        // 본인의 알림이 맞는지 보안 확인
        if (!userNotif.getUser().getId().equals(user.getId())) {
            log.warn("유저(ID:{})가 타인(ID:{})의 알림(ID:{})에 접근 시도", user.getId(), userNotif.getUser().getId(), userNotificationId);
            throw new BadRequestException("자신의 알림만 읽음 처리할 수 있습니다");
        }
        if (!userNotif.isRead()) {
            userNotif.setRead(true);
            userNotificationRepository.save(userNotif);
        }
    }

    // 모든 알림 읽음 처리
    public void markAllAsRead(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<UserNotification> unreadNotifications = userNotificationRepository.findAllByUserAndIsRead(user, false);
        if (unreadNotifications.isEmpty()) {
            return; //이미 다 읽었으면 아무것도 하지 않음
        }
        for (UserNotification notif : unreadNotifications) {
            notif.setRead(true);
        }
        userNotificationRepository.saveAll(unreadNotifications); //DB에 일괄 저장
    }

    // 내부용 알림 생성 로직 - 특정 유저 1명에게 알림 생성
    public void createNotification(User recipient, String content, String link) {
        if (recipient == null) {
            log.warn("알림 수신자(recipient)가 null입니다.");
            return;
        }

        // 공통 알림 내용 저장
        Notification notification = Notification.builder()
                .content(content)
                .link(link)
                .build();
        notificationRepository.save(notification);

        // 특정 유저를 위한 알림 생성
        UserNotification userNotification = UserNotification.builder()
                .user(recipient)
                .notification(notification)
                .isRead(false)
                .build();
        userNotificationRepository.save(userNotification);
    }

    // 내부용 알림 생성 로직 - 특정 아티스를 팔로우하는 모든 유저들에게 알림 생성
    public void createNotificationForArtistFollowers(Artist artist, String content, String link) {
        // 공통 알림 내용 저장
        Notification notification = Notification.builder()
                .content(content)
                .link(link)
                .build();
        notificationRepository.save(notification);

        // 해당 아티스트를 팔로우하는 모든 유저 조회
        List<User> followers = userArtistRepository.findAllByArtist(artist).stream()
                .map(UserArtist::getUser)
                .toList();

        if (followers.isEmpty()) {
            log.info("아티스트(ID:{})에게 팔로워가 없어 알림을 생성하지 않습니다.", artist.getArtistId());
            return;
        }

        // 각 유저별로 UserNotification 생성
        List<UserNotification> userNotifications = new ArrayList<>();
        for (User user : followers) {
            userNotifications.add(UserNotification.builder()
                    .user(user)
                    .notification(notification)
                    .isRead(false)
                    .build());
        }

        userNotificationRepository.saveAll(userNotifications);
        log.info("아티스트(ID:{})의 팔로워 {}명에게 알림을 일괄 생성했습니다.", artist.getArtistId(), followers.size());
    }

    // 내부용 알림 생성 로직 - 모든 관리자에게 알림 생성
    public void createNotificationForAdmins(String content, String link) {
        // 모든 관리자 조회
        List<User> admins = userRepository.findAllByAuth(AuthRole.ADMIN);
        if (admins.isEmpty()) {
            log.warn("관리자 유저가 없어 알림을 생성하지 못했습니다.");
            return;
        }
        // 공통 알림 내용 저장
        Notification notification = Notification.builder()
                .content(content)
                .link(link)
                .build();
        notificationRepository.save(notification);

        // 각 관리자별로 UserNotification 생성
        List<UserNotification> adminNotifications = new ArrayList<>();
        for (User admin : admins) {
            adminNotifications.add(UserNotification.builder()
                    .user(admin)
                    .notification(notification)
                    .isRead(false)
                    .build());
        }
        userNotificationRepository.saveAll(adminNotifications);
        log.info("관리자 {}명에게 알림을 일괄 생성했습니다.", admins.size());
    }

    // 유틸리티 메서드
    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SimpleUserDetails)) {
            throw new BadRequestException("유효한 로그인 정보가 없습니다. (Auth is null or not SimpleUserDetails)");
        }
        SimpleUserDetails userDetails = (SimpleUserDetails) authentication.getPrincipal();
        return userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("인증 정보에 해당하는 유저를 찾을 수 없습니다. ID: " + userDetails.getUserId()));
    }
}
