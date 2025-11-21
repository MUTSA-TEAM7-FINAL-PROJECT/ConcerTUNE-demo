package com.team7.ConcerTUNE.entity;

import com.team7.ConcerTUNE.dto.RegisterRequest;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
@AllArgsConstructor
public class User extends BaseEntity   {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(length = 200)
    private String password;

    @Column(length = 200)
    private String email;

    @Column(name = "phone_num", length = 20)
    private String phoneNum;

    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    @Column(length = 15)
    private String username;

    @Column(name = "provider_id", length = 100)
    private String providerId;

    @Column(name = "isEnabled")
    private Boolean enabled = true;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    @Column(length = 500)
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Enumerated(EnumType.STRING)
    @Column(length = 48, nullable = false)
    private AuthRole auth = AuthRole.USER;

    @Builder
    public User(String email, String password, String username, AuthRole auth,
                String phoneNum, String profileImageUrl, String providerId,
                Boolean enabled, AuthProvider provider, String bio, String tags) {
        this.email = email;
        this.password = password;
        this.username = username;
        this.auth = auth != null ? auth : AuthRole.USER;
        this.phoneNum = phoneNum;
        this.profileImageUrl = profileImageUrl;
        this.providerId = providerId;
        this.enabled = enabled != null ? enabled : true;
        this.provider = provider;
        this.bio = bio;
        this.tags = tags;
    }

    public static User from(RegisterRequest request, String encodedPassword) {
        return User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(encodedPassword)
                .provider(AuthProvider.LOCAL)
                .auth(AuthRole.USER)
                .enabled(true)
                .build();
        // phoneNum, profileImageUrl, providerId, bio, tags는 초기에는 null로 설정됨
        }
}