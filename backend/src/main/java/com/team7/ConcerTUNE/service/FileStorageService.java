package com.team7.ConcerTUNE.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.team7.ConcerTUNE.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final AmazonS3 s3Client;

    @Value("${aws.s3.bucket-name")
    private String bucketName;

    public String uploadFile(MultipartFile file, String dirName) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("업로드할 파일이 없습니다.");
        }

        // 파일을 S3에 업로드하고 접근 가능한 URL 반환
        try {
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = createFileName(originalFileName);
            String s3Key = dirName + "/" + uniqueFileName;

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            s3Client.putObject(new PutObjectRequest(
                    bucketName, s3Key, file.getInputStream(), metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead)
            );

            return s3Client.getUrl(bucketName, s3Key).toString();
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
        }
    }

    // S3에 업로드된 파일 삭제
    public void deleteFile(String fileUrl) {
        try {
            String s3Key = extractKeyFromUrl(fileUrl);
            s3Client.deleteObject(new DeleteObjectRequest(bucketName, s3Key));
        } catch (Exception e) {
            System.err.println("S3 파일 삭제 실패: " + fileUrl + " | " + e.getMessage());
        }
    }

    // 헬퍼 메서드
    // S3 키 생성
    private String createFileName(String originalFileName) {
        String ext = extractExt(originalFileName);
        String uuid = UUID.randomUUID().toString();
        return uuid + "." + ext;
    }

    // 원본 파일명에서 확장자 추출
    private String extractExt(String originalFileName) {
        try {
            return originalFileName.substring(originalFileName.lastIndexOf(".") + 1);
        } catch (Exception e) {
            throw new BadRequestException("잘못된 파일 형식입니다: 확장자 없음");
        }
    }

    // S3 URL에서 키(파일 경로) 호출
    private String extractKeyFromUrl(String fileUrl) {
        try {
            String baseUrl = s3Client.getUrl(bucketName, "").toString();
            String s3Key = fileUrl.substring(baseUrl.length());
            return URLDecoder.decode(s3Key, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new BadRequestException("잘못된 S3 URL 형식입니다.");
        }
    }
}
