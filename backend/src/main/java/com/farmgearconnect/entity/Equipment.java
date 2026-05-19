package com.farmgearconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "equipment", indexes = {
    @Index(name = "idx_equipment_owner", columnList = "owner_id"),
    @Index(name = "idx_equipment_status", columnList = "status"),
    @Index(name = "idx_equipment_category", columnList = "category"),
    @Index(name = "idx_equipment_district", columnList = "district"),
    @Index(name = "idx_equipment_state", columnList = "state"),
    @Index(name = "idx_equipment_location", columnList = "latitude,longitude")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentCategory category;

    @Column
    private String brand;

    @Enumerated(EnumType.STRING)
    @Column
    private FuelType fuelType;

    @Column
    private String modelNumber;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerHour;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(precision = 10, scale = 2)
    private BigDecimal depositAmount;

    @Column
    private Integer minRentalDurationHours;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String district;

    @Column
    private String village;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EquipmentStatus status = EquipmentStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String adminNote;

    @Column
    private LocalDate availableFrom;

    @Column
    private LocalDate availableTo;

    @Column(columnDefinition = "TEXT")
    private String specifications;

    @Column(nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column
    @Builder.Default
    private Double averageRating = 0.0;

    @Column
    @Builder.Default
    private Integer totalReviews = 0;

    @Column
    @Builder.Default
    private Integer totalBookings = 0;

    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EquipmentImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime deletedAt;

    public enum EquipmentCategory {
        TRACTOR, HARVESTER, PLOUGH, SEEDER, SPRAYER, IRRIGATION_PUMP,
        THRESHER, CULTIVATOR, ROTAVATOR, POWER_TILLER, COMBINE_HARVESTER,
        RICE_TRANSPLANTER, POTATO_PLANTER, SUGARCANE_HARVESTER, OTHER
    }

    public enum FuelType {
        DIESEL, PETROL, ELECTRIC, MANUAL, SOLAR
    }

    public enum EquipmentStatus {
        DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED, ARCHIVED
    }
}
