package com.team7.ConcerTUNE.dto;

import com.team7.ConcerTUNE.entity.AuthRole;
import com.team7.ConcerTUNE.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String username;
    private String profileImageUrl;
    private String bio;
    private String tags;
    private AuthRole auth;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .tags(user.getTags())
                .auth(user.getAuth())
                .build();
    }
}
