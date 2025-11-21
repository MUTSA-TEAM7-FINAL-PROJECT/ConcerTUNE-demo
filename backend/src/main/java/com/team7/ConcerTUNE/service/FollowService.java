package com.team7.ConcerTUNE.service;

import com.team7.ConcerTUNE.dto.UserFollowResponse;
import com.team7.ConcerTUNE.entity.Follow;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.repository.FollowRepository;
import com.team7.ConcerTUNE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FollowService {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public void toggleFollow(User follower, Long targetId) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않은 사용자 입니다."));

        if (follower.getId().equals(target.getId())) {
            throw new IllegalArgumentException("자기 자신은 팔로우 할 수 없습니다.");
        }

        boolean isFollowing = followRepository.existsByFollowerAndFollowing(follower, target);

        if (isFollowing) {
            followRepository.deleteByFollowerAndFollowing(follower, target);
        } else {
            Follow follow = Follow.builder()
                    .follower(follower)
                    .following(target)
                    .build();
            followRepository.save(follow);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserFollowResponse> getFollowers(User user, Pageable pageable) {
        Page<User> followers = followRepository.findFollowersByUser(user, pageable);

        return followers.map(follower -> UserFollowResponse.builder()
                .id(follower.getId())
                .username(follower.getUsername())
                .profileImageUrl(follower.getProfileImageUrl())
                .build());
    }

    @Transactional(readOnly = true)
    public Page<UserFollowResponse> getFollowings(User user, Pageable pageable) {
        Page<User> followings = followRepository.findFollowingByUser(user, pageable);

        return followings.map(follower -> UserFollowResponse.builder()
                .id(follower.getId())
                .username(follower.getUsername())
                .profileImageUrl(follower.getProfileImageUrl())
                .build());
    }

}
