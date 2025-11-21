package com.team7.ConcerTUNE.security;

import com.team7.ConcerTUNE.entity.AuthProvider;
import com.team7.ConcerTUNE.entity.AuthRole;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.repository.UserRepository;
import com.team7.ConcerTUNE.util.UsernameGenerator;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        // 일반 로그인이 아닌데 OAuth2 토큰이 아닐 경우 오류 발생
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            log.error("인증 객체가 OAuth2AuthenticationToken이 아닙니다: {}", authentication.getClass().getName());
            throw new ServletException("OAuth2SuccessHandler는 OAuth2AuthenticationToken으로 호출되어야 합니다.");
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String registrationId = oauthToken.getAuthorizedClientRegistrationId();

        String provider = registrationId.toUpperCase();
        String providerId = oAuth2User.getName();

        String email = null;
        String name = null;
        String imageUrl = null;

        switch (registrationId) {
            case "google":
                email = oAuth2User.getAttribute("email");
                name = oAuth2User.getAttribute("name");
                imageUrl = oAuth2User.getAttribute("picture");
                break;

            case "spotify":
                email = oAuth2User.getAttribute("email");
                name = oAuth2User.getAttribute("display_name");
                imageUrl = getSpotifyAvatar(oAuth2User);
                break;

            default:
                email = oAuth2User.getAttribute("email");
                name = oAuth2User.getAttribute("name");
                imageUrl = oAuth2User.getAttribute("picture");
        }

        final String finalEmail = email;
        if (finalEmail == null) {
            log.error("OAuth 제공자 {}가 이메일 정보가 누락되었습니다.", registrationId);
            throw new ServletException("OAuth 제공자는 필수 정보인 이메일을 제공해야 합니다.");
        }
        final String finalimageUrl = imageUrl;

        // 사용자 조회 또는 신규 가입
        User user = userRepository.findByEmail(finalEmail)
                .orElseGet(() -> {
                    log.info("새로운 사용자 가입을 진행합니다: {}", finalEmail);
                    User newUser = User.builder()
                            .email(finalEmail)
                            .username(UsernameGenerator.generateUniqueUsername(userRepository))
                            .profileImageUrl(finalimageUrl)
                            .password("")
                            .auth(AuthRole.USER)
                            .enabled(true)
                            .provider(AuthProvider.valueOf(provider))
                            .providerId(providerId)
                            .build();
                    return userRepository.save(newUser);
                });


        if (user.getProvider() == AuthProvider.LOCAL) {
            String errorMessage = String.format(
                    "이미 로컬 계정으로 가입된 이메일입니다. 일반 로그인 또는 비밀번호 찾기를 이용해 주세요.");
            log.warn("사용자 {}의 Provider 충돌 (Local vs {}). 메시지: {}", user.getEmail(), provider, errorMessage);

            throw new AuthenticationException(errorMessage){};
        } else if (user.getProvider() != AuthProvider.valueOf(provider)) {

            String errorMessage = String.format(
                    "이미 '%s' 계정으로 가입된 이메일입니다. '%s'으로는 로그인할 수 없습니다.",
                    user.getProvider(), provider);

            log.warn("사용자 {}의 Provider 충돌 발생. 메시지: {}", user.getEmail(), errorMessage);

            throw new AuthenticationException(errorMessage){};
        }

        // 프로필 이미지 업데이트
        if (finalimageUrl != null && !finalimageUrl.equals(user.getProfileImageUrl())) {
            user.setProfileImageUrl(finalimageUrl);
            log.info("사용자 {}의 프로필 이미지를 업데이트했습니다.", user.getEmail());
        }

        // DB에 변경 사항 저장
        userRepository.save(user);

        // JWT 토큰 발급 및 리다이렉션
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        log.info("OAuth2 인증 성공. 사용자 {}에게 토큰 발급 후 {}로 리다이렉트합니다.", user.getEmail(), targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String getSpotifyAvatar(OAuth2User oAuth2User) {
        try {
            List<?> images = (List<?>) oAuth2User.getAttribute("images");
            if (images != null && !images.isEmpty()) {
                Map<?, ?> firstImage = (Map<?, ?>) images.get(0);
                return (String) firstImage.get("url");
            }
        } catch (Exception e) {
            log.warn("Spotify 아바타 URL 추출에 실패했습니다: {}", e.getMessage());
        }
        return null;
    }

    private String generateUniqueUsername(String email) {
        int maxAttempts = 5;
        String uniqueUsername = null;

        for (int i = 0; i < maxAttempts; i++) {
            String source = email + (i > 0 ? "_" + i : "");

            try {
                // 2. SHA-256 해시 생성 및 Base64 인코딩
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                byte[] hash = md.digest(source.getBytes(StandardCharsets.UTF_8));

                // 3. Base64 인코딩 후 12자리로 자르기
                String base64Hash = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
                uniqueUsername = base64Hash.substring(0, 12);

                // 4. DB 중복 검사
                if (!userRepository.existsByUsername(uniqueUsername)) {
                    log.info("고유한 닉네임 생성 성공: {}", uniqueUsername);
                    return uniqueUsername;
                }
                log.warn("닉네임 충돌 발생: {} (시도 {})", uniqueUsername, i + 1);

            } catch (java.security.NoSuchAlgorithmException e) {
                log.error("SHA-256 알고리즘을 찾을 수 없습니다. UUID로 대체합니다.", e);
                return java.util.UUID.randomUUID().toString().substring(0, 12);
            }
        }

        log.error("고유한 닉네임 생성 실패: 최대 시도 횟수 {}회 초과", maxAttempts);
        throw new RuntimeException("고유한 닉네임을 생성하지 못했습니다. 다시 시도해주세요.");
    }
}