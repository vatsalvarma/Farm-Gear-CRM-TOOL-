package com.farmgearconnect.service;

import com.farmgearconnect.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

/**
 * Storage service that saves all images directly into the MySQL database
 * as Base64-encoded data URIs (data:image/jpeg;base64,...).
 *
 * No external storage (MinIO / S3) required.
 * Images are retrieved by reading the stored data URI directly from the DB.
 */
@Service
@Slf4j
public class StorageService {

    private static final List<String> ALLOWED_IMAGE_TYPES =
            Arrays.asList("image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif");
    private static final List<String> ALLOWED_AUDIO_TYPES =
            Arrays.asList("audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4");

    // Max sizes
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024L;  // 5 MB
    private static final long MAX_AUDIO_SIZE = 10 * 1024 * 1024L; // 10 MB

    // ─────────────────────────────────────────────────────────────────────────
    // Public upload methods — all return a data URI stored directly in MySQL
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Converts an equipment image to a Base64 data URI for DB storage.
     * The equipmentId parameter is kept for API compatibility (unused here).
     */
    public String uploadEquipmentImage(MultipartFile file, UUID equipmentId) {
        validateImageFile(file);
        return toDataUri(file);
    }

    /**
     * Converts a profile photo to a Base64 data URI for DB storage.
     * The userId parameter is kept for API compatibility (unused here).
     */
    public String uploadProfilePhoto(MultipartFile file, UUID userId) {
        validateImageFile(file);
        return toDataUri(file);
    }

    /**
     * Converts a voice note to a Base64 data URI for DB storage.
     */
    public String uploadVoiceNote(MultipartFile file, UUID senderId) {
        if (!ALLOWED_AUDIO_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Invalid audio format. Allowed: MP3, WAV, OGG, WEBM");
        }
        if (file.getSize() > MAX_AUDIO_SIZE) {
            throw new BadRequestException("Audio file too large. Max 10 MB allowed");
        }
        return toDataUri(file);
    }

    /**
     * Converts a generic document to a Base64 data URI for DB storage.
     */
    public String uploadDocument(MultipartFile file, UUID userId) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        return toDataUri(file);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Legacy compatibility methods (no-ops when using DB storage)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * For DB storage, the "URL" is the data URI itself — nothing to generate.
     */
    public String getPresignedUrl(String objectNameOrDataUri) {
        return objectNameOrDataUri; // Already a data URI or stored reference
    }

    /**
     * No-op: DB records are deleted by removing the entity row.
     */
    public void deleteFile(String objectName) {
        log.debug("deleteFile called (no-op for DB storage): {}", objectName);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Encodes a MultipartFile into a RFC-2397 data URI:
     * {@code data:<mime>;base64,<base64-encoded-bytes>}
     */
    private String toDataUri(MultipartFile file) {
        try {
            String mime = (file.getContentType() != null && !file.getContentType().isBlank())
                    ? file.getContentType()
                    : "application/octet-stream";
            String b64 = Base64.getEncoder().encodeToString(file.getBytes());
            String dataUri = "data:" + mime + ";base64," + b64;
            log.debug("Encoded file '{}' ({} bytes) → data URI ({} chars)",
                    file.getOriginalFilename(), file.getSize(), dataUri.length());
            return dataUri;
        } catch (Exception e) {
            log.error("Failed to encode file to Base64: {}", e.getMessage());
            throw new RuntimeException("Image processing failed: " + e.getMessage());
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new BadRequestException(
                    "Invalid image format. Allowed: JPEG, PNG, WEBP, GIF. Got: " + file.getContentType());
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new BadRequestException(
                    "Image too large. Maximum size is 5 MB. Got: " + (file.getSize() / 1024 / 1024) + " MB");
        }
    }
}
