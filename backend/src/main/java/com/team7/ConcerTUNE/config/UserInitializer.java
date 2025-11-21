package com.team7.ConcerTUNE.config;

import com.team7.ConcerTUNE.entity.*;
import com.team7.ConcerTUNE.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;

@RequiredArgsConstructor
@Configuration
public class UserInitializer {
    private static final String DEFAULT_EMAIL = "user@naver.com";
    private static final String DEFAULT_PASSWORD = "password12";
    private static final String DEFAULT_USERNAME = "Initial User";

    private final UserRepository userRepository;
    private final  ArtistRepository artistRepository;
    private final LiveRepository livesRepository;
    private final LiveArtistRepository liveArtistRepository;
    private final ArtistManagerRepository artistManagerRepository; // 👈 추가

    @Bean
    public CommandLineRunner initDefaultUser(PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("--- 초기 유저 설정 ---");
            String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);

            User defaultUser1 = User.builder()
                    .email("user1@naver.com")
                    .password(encodedPassword)
                    .username(DEFAULT_USERNAME + "1")
                    .auth(AuthRole.USER)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();

            User defaultUser2 = User.builder()
                    .email("user2@naver.com")
                    .password(encodedPassword)
                    .username(DEFAULT_USERNAME + "2")
                    .auth(AuthRole.ARTIST)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();

            User defaultUser3 = User.builder()
                    .email("user3@naver.com")
                    .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                    .username(DEFAULT_USERNAME + "3")
                    .auth(AuthRole.ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();


            userRepository.save(defaultUser1);
            userRepository.save(defaultUser2);
            userRepository.save(defaultUser3);

            User artistManagerUser = User.builder()
                    .email("user4@artist.com")
                    .password(passwordEncoder.encode("artistmanager1")) // 별도의 비밀번호 설정
                    .username("ArtistManager")
                    // 아티스트 매니저 역할 부여 (AuthRole.ARTIST_FAN_MANAGER가 있다면 사용)
                    // 현재 AuthRole에 ARTIST_FAN_MANAGER가 없다면 USER 또는 ADMIN 사용
                    .auth(AuthRole.USER)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();

            userRepository.save(artistManagerUser);


            // ------------------------------------
            // 3. 아티스트 생성 및 유저 4와 연동
            // ------------------------------------
            Artist newArtist = Artist.builder()
                    .artistName("ConcertUNE Official Artist")
                    .isDomestic(true)
                    .snsUrl("https://instagram.com/concertune")
                    .artistImageUrl("https://image.url/default_artist.jpg")
                    .manager(artistManagerUser) // User 4를 매니저로 설정
                    .build();

            artistRepository.save(newArtist);

            ArtistManagerId artistManagerId = ArtistManagerId.builder()
                    .userId(artistManagerUser.getId())
                    .artistId(newArtist.getArtistId())
                    .build();

            ArtistManager artistManagerLink = ArtistManager.builder()
                    .id(artistManagerId)
                    .user(artistManagerUser)
                    .artist(newArtist)
                    .assignedAt(LocalDateTime.now())
                    .isOfficial(true)
                    .build();

            artistManagerRepository.save(artistManagerLink); // 👈 아티스트와 유저 연결 저장

            // ------------------------------------
            // 4. 공연 (Lives) 생성 및 저장
            // ------------------------------------
            Live live = Live.builder()
                    .title("[Official] ConcerTUNE Debut Live")
                    .description("ConcerTUNE 공식 아티스트의 첫 라이브 공연입니다.")
                    .posterUrl("https://image.url/debut_poster.jpg")
                    .ticketUrl("https://ticket.url/debut")
                    .venue("Seoul Live Hall")
                    .price(Map.of("VIP", 126000, "R", 66000))
                    .writer(artistManagerUser)
                    .build();

            livesRepository.save(live);


            // ------------------------------------
            // 5. 공연과 아티스트 연동 (LiveArtist 생성)
            // ------------------------------------
            LiveArtist liveArtistLink = LiveArtist.builder()
                    .live(live)
                    .artist(newArtist)
                    .build();

            liveArtistRepository.save(liveArtistLink);

            System.out.println("--- 초기 데이터 설정 완료 ---");
            System.out.println("매니저 유저: " + artistManagerUser.getUsername() + ", 아티스트: " + newArtist.getArtistName());
        };
    }
}