package com.team7.ConcerTUNE.controller;

import com.team7.ConcerTUNE.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class S3Controller {
    private final FileStorageService fileStorageService;

    // 파일 업로드
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("dir") String dir
    ) {
        String fileUrl = fileStorageService.uploadFile(file, dir);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    // 파일 삭제
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteFile(
            @RequestParam("fileUrl") String fileUrl
    ) {
        fileStorageService.deleteFile(fileUrl);
        return ResponseEntity.noContent().build();
    }
}
