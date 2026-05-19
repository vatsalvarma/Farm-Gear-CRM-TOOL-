package com.farmgearconnect.dto.response;

import com.farmgearconnect.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private UUID id;
    private String bookingReference;
    private Booking.BookingStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private String farmerNote;
    private String ownerNote;
    private String rejectionReason;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;

    private EquipmentSummary equipment;
    private UserSummary farmer;
    private UserSummary owner;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EquipmentSummary {
        private UUID id;
        private String title;
        private String primaryImageUrl;
        private String district;
        private String state;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserSummary {
        private UUID id;
        private String fullName;
        private String profilePhotoUrl;
    }
}
