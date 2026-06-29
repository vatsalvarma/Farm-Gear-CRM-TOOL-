package com.farmgearconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_kyc")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserKyc {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ── Personal / Address ──────────────────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 10)
    private String pincode;

    @Column(length = 100)
    private String mandal;

    // ── Identity ─────────────────────────────────────────────────────────
    @Column(length = 20)
    private String aadhaarNumber;

    @Column(length = 20)
    private String panNumber;

    // ── Bank Details ─────────────────────────────────────────────────────
    @Column(length = 200)
    private String bankAccountHolderName;

    @Column(length = 50)
    private String bankAccountNumber;

    @Column(length = 20)
    private String ifscCode;

    @Column(length = 200)
    private String bankName;

    // ── Owner Extras ──────────────────────────────────────────────────────
    @Column(length = 200)
    private String companyName;

    @Column(length = 30)
    private String gstNumber;

    @Column(columnDefinition = "TEXT")
    private String businessAddress;

    // ── Document Images (Base64 data URIs) ────────────────────────────────
    @Column(columnDefinition = "LONGTEXT")
    private String aadhaarFrontUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String aadhaarBackUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String panCardUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String passbookUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String companyDocUrl;

    // ── KYC Status ────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column
    private LocalDateTime submittedAt;

    @Column
    private LocalDateTime reviewedAt;

    @Column(length = 36)
    private String reviewedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ── Enum ──────────────────────────────────────────────────────────────
    public enum KycStatus {
        PENDING,       // not yet submitted
        SUBMITTED,     // farmer/owner submitted, awaiting admin review
        APPROVED,      // admin approved
        REJECTED       // admin rejected, needs re-submission
    }
}
