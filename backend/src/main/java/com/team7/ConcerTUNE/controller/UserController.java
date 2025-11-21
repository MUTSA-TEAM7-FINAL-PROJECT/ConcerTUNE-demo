package com.team7.ConcerTUNE.controller;

import com.team7.ConcerTUNE.dto.UserFollowResponse;
import com.team7.ConcerTUNE.dto.UserResponse;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.service.FollowService;
import com.team7.ConcerTUNE.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final FollowService followService;

    //내 프로필 보기
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getMyProfile(user));
    }

    //유저 프로필 보기
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.findById(userId));
    }

    //내 프로필 수정
    @PatchMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponse> updateMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.updateMyProfile(user));
    }

    //내 프로필 이미지 등록
    @PostMapping("/me/profile-image")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponse> uploadProfileImage(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile imageFile) throws IOException {
        return ResponseEntity.ok(userService.uploadProfileImage(user, imageFile));
    }

    //내 프로필 이미지 삭제
    @DeleteMapping("/me/profile-image")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponse> deleteProfileImage(@AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(userService.deleteProfileImage(user));
    }

    //계정 삭제
    @DeleteMapping("/me")
    @PreAuthorize("hasRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal User user) {
        userService.deleteUser(user);
        return ResponseEntity.noContent().build();
    }

    //팔로우, 언팔로우
    @PostMapping("/{targetId}/follow")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> toggleFollow(
            @AuthenticationPrincipal User follower,
            @PathVariable Long targetId) {
        followService.toggleFollow(follower, targetId);
        return ResponseEntity.ok().build();
    }

    //팔로워 유저들 조회
    @GetMapping("/me/followers")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<UserFollowResponse>> getMyFollowers(
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        return ResponseEntity.ok(followService.getFollowers(user, pageable));
    }

    //팔로잉 유저들 조회
    @GetMapping("/me/following")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<UserFollowResponse>> getMyFollowing(
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        return ResponseEntity.ok(followService.getFollowings(user, pageable));
    }
}
