package com.farmgearconnect.service;

import com.farmgearconnect.dto.response.MessageResponse;
import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.entity.*;
import com.farmgearconnect.exception.ForbiddenException;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.repository.BookingRepository;
import com.farmgearconnect.repository.MessageRepository;
import com.farmgearconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponse sendTextMessage(UUID senderId, UUID receiverId,
                                            String content, UUID bookingId) {
        User sender = getUser(senderId);
        User receiver = getUser(receiverId);
        validateChatPermission(sender, receiver);

        Booking booking = bookingId != null
                ? bookingRepository.findById(bookingId).orElse(null) : null;

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .booking(booking)
                .content(content)
                .messageType(Message.MessageType.TEXT)
                .build();

        message = messageRepository.save(message);
        MessageResponse response = mapToResponse(message);

        pushToWebSocket(receiver.getId(), response);
        notifyReceiver(sender, receiver, "sent you a message");
        return response;
    }

    @Transactional
    public MessageResponse sendVoiceNote(UUID senderId, UUID receiverId,
                                          MultipartFile audioFile, UUID bookingId) {
        User sender = getUser(senderId);
        User receiver = getUser(receiverId);
        validateChatPermission(sender, receiver);

        String mediaUrl = storageService.uploadVoiceNote(audioFile, senderId);

        Booking booking = bookingId != null
                ? bookingRepository.findById(bookingId).orElse(null) : null;

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .booking(booking)
                .messageType(Message.MessageType.VOICE_NOTE)
                .mediaUrl(mediaUrl)
                .build();

        message = messageRepository.save(message);
        MessageResponse response = mapToResponse(message);

        pushToWebSocket(receiver.getId(), response);
        notifyReceiver(sender, receiver, "sent you a voice note");
        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<MessageResponse> getConversation(UUID userId, UUID otherUserId,
                                                          int page, int size) {
        User user = getUser(userId);
        User other = getUser(otherUserId);

        var messages = messageRepository.findConversation(
                user, other,
                PageRequest.of(page, size, Sort.by("createdAt").ascending()));

        messageRepository.markMessagesAsRead(other, user);

        return PageResponse.from(messages.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public List<ConversationSummary> getConversationList(UUID userId) {
        User user = getUser(userId);
        List<User> participants = messageRepository.findConversationParticipants(user);

        return participants.stream().map(other -> {
            List<Message> latest = messageRepository.findLatestMessage(
                    user, other, PageRequest.of(0, 1));
            long unread = messageRepository.countUnreadMessages(user);

            return new ConversationSummary(
                    other.getId(),
                    other.getFullName(),
                    other.getProfilePhotoUrl(),
                    other.getDistrict(),
                    latest.isEmpty() ? null : latest.get(0).getContent(),
                    latest.isEmpty() ? null : latest.get(0).getCreatedAt().toString(),
                    latest.isEmpty() ? null : latest.get(0).getMessageType().name(),
                    unread > 0
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        User user = getUser(userId);
        return messageRepository.countUnreadMessages(user);
    }

    private void validateChatPermission(User sender, User receiver) {
        if (sender.getId().equals(receiver.getId())) {
            throw new ForbiddenException("Cannot message yourself");
        }
        boolean adminInvolved = sender.getRole() == User.UserRole.ADMIN
                || receiver.getRole() == User.UserRole.ADMIN;
        if (!adminInvolved) {
            boolean senderIsOwnerOrFarmer =
                    (sender.getRole() == User.UserRole.OWNER
                            || sender.getRole() == User.UserRole.FARMER)
                    && (receiver.getRole() == User.UserRole.OWNER
                            || receiver.getRole() == User.UserRole.FARMER);
            if (!senderIsOwnerOrFarmer) {
                throw new ForbiddenException("Chat not permitted between these roles");
            }
        }
    }

    private void pushToWebSocket(UUID receiverId, MessageResponse response) {
        try {
            messagingTemplate.convertAndSendToUser(
                    receiverId.toString(), "/queue/messages", response);
        } catch (Exception e) {
            log.warn("WebSocket push failed for user {}: {}", receiverId, e.getMessage());
        }
    }

    private void notifyReceiver(User sender, User receiver, String action) {
        notificationService.send(
                receiver,
                "New Message from " + sender.getFullName(),
                sender.getFullName() + " " + action,
                Notification.NotificationType.NEW_MESSAGE,
                sender.getId().toString());
    }

    private User getUser(UUID id) {
        return userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private MessageResponse mapToResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .content(m.getContent())
                .messageType(m.getMessageType())
                .mediaUrl(m.getMediaUrl())
                .mediaDurationSeconds(m.getMediaDurationSeconds())
                .read(m.isRead())
                .readAt(m.getReadAt())
                .createdAt(m.getCreatedAt())
                .sender(MessageResponse.SenderInfo.builder()
                        .id(m.getSender().getId())
                        .fullName(m.getSender().getFullName())
                        .profilePhotoUrl(m.getSender().getProfilePhotoUrl())
                        .build())
                .receiver(MessageResponse.SenderInfo.builder()
                        .id(m.getReceiver().getId())
                        .fullName(m.getReceiver().getFullName())
                        .profilePhotoUrl(m.getReceiver().getProfilePhotoUrl())
                        .build())
                .build();
    }

    public record ConversationSummary(
            UUID userId,
            String fullName,
            String profilePhotoUrl,
            String district,
            String lastMessage,
            String lastMessageTime,
            String lastMessageType,
            boolean hasUnread
    ) {}
}
