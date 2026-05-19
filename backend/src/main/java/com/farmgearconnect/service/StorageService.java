package com.farmgearconnect.service;

import com.farmgearconnect.exception.BadRequestException;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final MinioClient minioClient;

    @Value("${app.minio.bucket-name}")
    private String bucketName;

    private static final List<String> ALLOWED_IMAGE_TYPES =
            Arrays.asList("image/jpeg", "image/png", "image/webp", "image/jpg");
    private static final List<String> ALLOWED_AUDIO_TYPES =
            Arrays.asList("audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4");
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024L;
    private static final long MAX_AUDIO_SIZE = 25 * 1024 * 1024L;

    public String uploadEquipmentImage(MultipartFile file, UUID equipmentId) {
        validateImageFile(file);
        String path = "equipment/" + equipmentId + "/" + UUID.randomUUID() + getExtension(file);
        return uploadFile(file, path);
    }

    public String uploadProfilePhoto(MultipartFile file, UUID userId) {
        validateImageFile(file);
        String path = "profiles/" + userId + "/" + UUID.randomUUID() + getExtension(file);
        return uploadFile(file, path);
    }

    public String uploadVoiceNote(MultipartFile file, UUID senderId) {
        if (!ALLOWED_AUDIO_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Invalid audio format. Allowed: MP3, WAV, OGG, WEBM");
        }
        if (file.getSize() > MAX_AUDIO_SIZE) {
            throw new BadRequestException("Audio file too large. Max 25MB allowed");
        }
        String path = "voice-notes/" + senderId + "/" + UUID.randomUUID() + getExtension(file);
        return uploadFile(file, path);
    }

    public String uploadDocument(MultipartFile file, UUID userId) {
        String path = "documents/" + userId + "/" + UUID.randomUUID() + getExtension(file);
        return uploadFile(file, path);
    }

    private String uploadFile(MultipartFile file, String objectName) {
        try {
            ensureBucketExists();
            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build());
            }
            return getPresignedUrl(objectName);
        } catch (Exception e) {
            log.error("Failed to upload file {}: {}", objectName, e.getMessage());
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    public String getPresignedUrl(String objectName) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(objectName)
                    .expiry(7, TimeUnit.DAYS)
                    .build());
        } catch (Exception e) {
            log.error("Failed to generate presigned URL: {}", e.getMessage());
            return null;
        }
    }

    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.error("Failed to delete file {}: {}", objectName, e.getMessage());
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean found = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            log.info("Created MinIO bucket: {}", bucketName);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Invalid image format. Allowed: JPEG, PNG, WEBP");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new BadRequestException("Image too large. Max 10MB allowed");
        }
    }

    private String getExtension(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            return original.substring(original.lastIndexOf("."));
        }
        return "";
    }
}
