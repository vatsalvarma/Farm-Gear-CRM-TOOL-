package com.farmgearconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user", columnList = "user_id"),
    @Index(name = "idx_notifications_read", columnList = "user_id,is_read"),
    @Index(name = "idx_notifications_type", columnList = "type")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column
    private String referenceId;

    @Column
    @Builder.Default
    private boolean isRead = false;

    @Column
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING_REQUEST, BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
        BOOKING_COMPLETED, LISTING_APPROVED, LISTING_REJECTED, NEW_MESSAGE,
        SUBSCRIPTION_EXPIRY, REVIEW_RECEIVED, ADMIN_ANNOUNCEMENT, SYSTEM,
        KYC_SUBMITTED, KYC_APPROVED, KYC_REJECTED
    }
}
