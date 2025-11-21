package com.team7.ConcerTUNE.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowResponse {
    private boolean isFollowing;
    private long followerCount;
    private long followingCount;
}
