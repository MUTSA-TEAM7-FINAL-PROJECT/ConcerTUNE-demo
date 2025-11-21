package com.team7.ConcerTUNE.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFollowResponse {
    private Long id;
    private String username;
    private String profileImageUrl;
    private boolean isFollowing;
}
