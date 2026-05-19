package com.farmgearconnect.dto.response;

import com.farmgearconnect.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private UUID id;
    private String content;
    private Message.MessageType messageType;
    private String mediaUrl;
    private Long mediaDurationSeconds;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private SenderInfo sender;
    private SenderInfo receiver;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SenderInfo {
        private UUID id;
        private String fullName;
        private String profilePhotoUrl;
    }
}
