package com.farmgearconnect.service;

import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.entity.Notification;
import com.farmgearconnect.entity.User;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.repository.NotificationRepository;
import com.farmgearconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    @Transactional
    public void send(User user, String title, String body,
                     Notification.NotificationType type, String referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .body(body)
                .type(type)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);

        try {
            messagingTemplate.convertAndSendToUser(
                    user.getId().toString(),
                    "/queue/notifications",
                    notification);
        } catch (Exception e) {
            log.warn("Failed to push WebSocket notification to user {}: {}",
                    user.getId(), e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<Notification> getNotifications(UUID userId, int page, int size) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var notifications = notificationRepository.findByUserOrderByCreatedAtDesc(
                user, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.from(notifications);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.markAllAsRead(user);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.markAsRead(notificationId, user);
    }

    @Async
    @Transactional
    public void broadcastToAll(String title, String body) {
        userRepository.findAll().forEach(user ->
                send(user, title, body,
                        Notification.NotificationType.ADMIN_ANNOUNCEMENT, null));
    }
}
