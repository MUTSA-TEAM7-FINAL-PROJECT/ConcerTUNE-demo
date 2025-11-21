package com.team7.ConcerTUNE.service;

import com.team7.ConcerTUNE.dto.UserResponse;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.exception.BadRequestException;
import com.team7.ConcerTUNE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    //내 프로필 조회
    public UserResponse getMyProfile(User user) {
        return UserResponse.from(user);
    }

    //유저 프로필 조회
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return UserResponse.from(user);
    }

    // 유저 엔티티 반환
    public User findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }

    //내 프로필 수정
    public UserResponse updateMyProfile(User user) {
        User updateUser = userRepository.save(user);

        return UserResponse.from(updateUser);
    }

    //내 프로필 이미지 등록
    public UserResponse uploadProfileImage(User user, MultipartFile imageFile) throws IOException {
        if (imageFile == null || imageFile.isEmpty()) throw new BadRequestException("파일이 비어있습니다.");
        if (imageFile.getContentType() == null || !imageFile.getContentType().startsWith("image/")) {
            throw new org.apache.coyote.BadRequestException("이미지 파일만 업로드 가능합니다.");
        }

        deleteOldProfileImage(user.getProfileImageUrl());

        String ext = imageFile.getOriginalFilename()
                .substring(imageFile.getOriginalFilename().lastIndexOf("."));
        String stored = UUID.randomUUID() + ext;

        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        Path path = dir.resolve(stored);
        Files.copy(imageFile.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        String newUrl = "/api/upload/profiles/" + stored;
        user.setProfileImageUrl(newUrl);
        userRepository.save(user);

        return UserResponse.from(user);
    }

    //내 프로필 이미지 삭제
    public UserResponse deleteProfileImage(User user) throws IOException{
        if (user.getProfileImageUrl() == null || user.getProfileImageUrl().isBlank()) {
            throw new IllegalStateException("삭제할 프로필 이미지가 없습니다.");
        }

        deleteOldProfileImage(user.getProfileImageUrl());
        user.setProfileImageUrl(null);
        userRepository.save(user);

        return UserResponse.from(user);
    }

    //예전 이미지 삭제
    public void deleteOldProfileImage(String imageUrl) throws IOException{
        if (imageUrl == null || !imageUrl.isBlank()) return;
        String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        Path oldPath = Paths.get(uploadDir).resolve(fileName);
        Files.deleteIfExists(oldPath);
    }

    //계정 탈퇴
    public void deleteUser(User user) {
        userRepository.delete(user);
    }
}
