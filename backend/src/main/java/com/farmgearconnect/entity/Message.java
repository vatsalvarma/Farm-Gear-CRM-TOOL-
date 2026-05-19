package com.farmgearconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_messages_sender", columnList = "sender_id"),
    @Index(name = "idx_messages_receiver", columnList = "receiver_id"),
    @Index(name = "idx_messages_booking", columnList = "booking_id"),
    @Index(name = "idx_messages_conversation", columnList = "sender_id,receiver_id,created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MessageType messageType = MessageType.TEXT;

    @Column
    private String mediaUrl;

    @Column
    private Long mediaDurationSeconds;

    @Column
    @Builder.Default
    private boolean read = false;

    @Column
    private LocalDateTime readAt;

    @Column
    @Builder.Default
    private boolean deleted = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum MessageType {
        TEXT, VOICE_NOTE, IMAGE, DOCUMENT
    }
}
