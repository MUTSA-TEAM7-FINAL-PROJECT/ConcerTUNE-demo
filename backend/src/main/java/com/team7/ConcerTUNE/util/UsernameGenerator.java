package com.team7.ConcerTUNE.util;

import com.team7.ConcerTUNE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
public class UsernameGenerator {

    private static final List<String> ADJECTIVES = List.of("신나는", "열정적인", "잔잔한", "따뜻한", "경쾌한");
    private static final List<String> NOUNS = List.of("관객", "멜로디", "베이스", "앵콜", "피날레", "소나타");

    public static String generateUniqueUsername(UserRepository userRepository) {
        int maxAttempts = 5;

        for (int i = 0; i < maxAttempts; i++) {

            String adj = ADJECTIVES.get((int) (Math.random() * ADJECTIVES.size()));
            String noun = NOUNS.get((int) (Math.random() * NOUNS.size()));
            String baseName = adj + noun;

            int min = 1;
            int max = 9999;
            int randomNumber = (int)(Math.random() * (max - min + 1)) + min;

            String uniqueUsername = baseName + randomNumber;

            if (!userRepository.existsByUsername(uniqueUsername)) {
                log.info("고유한 닉네임 생성 성공: {}", uniqueUsername);
                return uniqueUsername;
            }

            log.warn("닉네임 충돌 발생: {} (시도 {})", uniqueUsername, i + 1);
        }

        log.error("고유한 닉네임 생성 실패: 최대 시도 횟수 {}회 초과", maxAttempts);
        throw new RuntimeException("고유한 닉네임을 생성하지 못했습니다.");
    }
}