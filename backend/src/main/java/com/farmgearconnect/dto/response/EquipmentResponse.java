package com.farmgearconnect.dto.response;

import com.farmgearconnect.entity.Equipment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {

    private UUID id;
    private String title;
    private String description;
    private Equipment.EquipmentCategory category;
    private String brand;
    private Equipment.FuelType fuelType;
    private String modelNumber;
    private BigDecimal pricePerHour;
    private BigDecimal pricePerDay;
    private BigDecimal depositAmount;
    private Integer minRentalDurationHours;
    private String state;
    private String district;
    private String village;
    private String address;
    private Double latitude;
    private Double longitude;
    private Equipment.EquipmentStatus status;
    private String adminNote;
    private LocalDate availableFrom;
    private LocalDate availableTo;
    private String specifications;
    private boolean featured;
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalBookings;
    private List<ImageResponse> images;
    private OwnerSummary owner;
    private LocalDateTime createdAt;
    private Double distanceKm;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageResponse {
        private UUID id;
        private String imageUrl;
        private String thumbnailUrl;
        private Integer sortOrder;
        private boolean isPrimary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerSummary {
        private UUID id;
        private String fullName;
        private String profilePhotoUrl;
        private String district;
        private String state;
    }
}
