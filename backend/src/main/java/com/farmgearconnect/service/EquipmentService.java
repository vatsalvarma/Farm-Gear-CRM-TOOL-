package com.farmgearconnect.service;

import com.farmgearconnect.dto.request.EquipmentPatchRequest;
import com.farmgearconnect.dto.request.EquipmentRequest;
import com.farmgearconnect.dto.response.EquipmentResponse;
import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.entity.*;
import com.farmgearconnect.exception.BadRequestException;
import com.farmgearconnect.exception.ForbiddenException;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentImageRepository equipmentImageRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final NotificationService notificationService;
    private final StorageService storageService;

    @Transactional
    public EquipmentResponse createListing(UUID ownerId, EquipmentRequest request) {
        User owner = userRepository.findByIdAndDeletedAtIsNull(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        if (equipmentRepository.existsByTitleAndOwnerAndDeletedAtIsNull(
                request.getTitle(), owner)) {
            throw new BadRequestException(
                    "You already have a listing with the same title");
        }

        Equipment equipment = Equipment.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .brand(request.getBrand())
                .fuelType(request.getFuelType())
                .modelNumber(request.getModelNumber())
                .pricePerHour(request.getPricePerHour())
                .pricePerDay(request.getPricePerDay())
                .depositAmount(request.getDepositAmount())
                .minRentalDurationHours(request.getMinRentalDurationHours())
                .state(request.getState())
                .district(request.getDistrict())
                .village(request.getVillage())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .specifications(request.getSpecifications())
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .status(Equipment.EquipmentStatus.DRAFT)
                .build();

        equipment = equipmentRepository.save(equipment);
        return mapToResponse(equipment, null);
    }

    @Transactional
    public EquipmentResponse addImages(UUID equipmentId, UUID ownerId,
                                       List<MultipartFile> files) {
        Equipment equipment = getEquipmentForOwner(equipmentId, ownerId);

        if (files.size() + equipment.getImages().size() > 10) {
            throw new BadRequestException("Maximum 10 images allowed per listing");
        }

        int sortOrder = equipment.getImages().size();
        for (MultipartFile file : files) {
            String url = storageService.uploadEquipmentImage(file, equipmentId);
            EquipmentImage image = EquipmentImage.builder()
                    .equipment(equipment)
                    .imageUrl(url)
                    .sortOrder(sortOrder++)
                    .isPrimary(equipment.getImages().isEmpty())
                    .fileSizeBytes(file.getSize())
                    .build();
            equipmentImageRepository.save(image);
        }

        return mapToResponse(equipmentRepository.findById(equipmentId).orElseThrow(), null);
    }

    @Transactional
    public EquipmentResponse submitForApproval(UUID equipmentId, UUID ownerId) {
        Equipment equipment = getEquipmentForOwner(equipmentId, ownerId);

        if (equipment.getStatus() != Equipment.EquipmentStatus.DRAFT
                && equipment.getStatus() != Equipment.EquipmentStatus.REJECTED) {
            throw new BadRequestException("Only draft or rejected listings can be submitted");
        }

        equipment.setStatus(Equipment.EquipmentStatus.PENDING_APPROVAL);
        equipment = equipmentRepository.save(equipment);

        notifyAdmins(equipment);
        return mapToResponse(equipment, null);
    }

    @Transactional
    public EquipmentResponse updateListing(UUID equipmentId, UUID ownerId,
                                            EquipmentRequest request) {
        Equipment equipment = getEquipmentForOwner(equipmentId, ownerId);

        if (equipment.getStatus() == Equipment.EquipmentStatus.APPROVED) {
            equipment.setStatus(Equipment.EquipmentStatus.PENDING_APPROVAL);
        }

        equipment.setTitle(request.getTitle());
        equipment.setDescription(request.getDescription());
        equipment.setCategory(request.getCategory());
        equipment.setBrand(request.getBrand());
        equipment.setFuelType(request.getFuelType());
        equipment.setModelNumber(request.getModelNumber());
        equipment.setPricePerHour(request.getPricePerHour());
        equipment.setPricePerDay(request.getPricePerDay());
        equipment.setDepositAmount(request.getDepositAmount());
        equipment.setMinRentalDurationHours(request.getMinRentalDurationHours());
        equipment.setState(request.getState());
        equipment.setDistrict(request.getDistrict());
        equipment.setVillage(request.getVillage());
        equipment.setLatitude(request.getLatitude());
        equipment.setLongitude(request.getLongitude());
        equipment.setAddress(request.getAddress());
        equipment.setSpecifications(request.getSpecifications());
        equipment.setAvailableFrom(request.getAvailableFrom());
        equipment.setAvailableTo(request.getAvailableTo());

        return mapToResponse(equipmentRepository.save(equipment), null);
    }

    @Transactional
    public void deleteListing(UUID equipmentId, UUID ownerId) {
        Equipment equipment = getEquipmentForOwner(equipmentId, ownerId);
        equipment.setDeletedAt(LocalDateTime.now());
        equipmentRepository.save(equipment);
    }

    /**
     * Partial update — only prices and availability status.
     * Does NOT reset admin approval status (no re-review required).
     */
    @Transactional
    public EquipmentResponse patchListing(UUID equipmentId, UUID ownerId,
                                           EquipmentPatchRequest patch) {
        Equipment equipment = getEquipmentForOwner(equipmentId, ownerId);

        if (patch.getPricePerDay() != null)
            equipment.setPricePerDay(patch.getPricePerDay());
        if (patch.getPricePerHour() != null)
            equipment.setPricePerHour(patch.getPricePerHour());
        if (patch.getDepositAmount() != null)
            equipment.setDepositAmount(patch.getDepositAmount());
        if (patch.getAvailabilityStatus() != null)
            equipment.setAvailabilityStatus(patch.getAvailabilityStatus());

        return mapToResponse(equipmentRepository.save(equipment), null);
    }

    @Transactional(readOnly = true)
    public PageResponse<EquipmentResponse> getOwnerListings(UUID ownerId, int page, int size) {
        User owner = userRepository.findByIdAndDeletedAtIsNull(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        Page<Equipment> equipmentPage = equipmentRepository.findByOwnerAndDeletedAtIsNull(
                owner, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.from(equipmentPage.map(e -> mapToResponse(e, null)));
    }

    @Transactional(readOnly = true)
    public PageResponse<EquipmentResponse> searchMarketplace(
            Equipment.EquipmentCategory category,
            String brand,
            Equipment.FuelType fuelType,
            String state,
            String district,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            String sortBy,
            int page, int size) {

        Sort sort = buildSort(sortBy);
        Page<Equipment> results = equipmentRepository.searchEquipment(
                category, brand, fuelType, state, district,
                minPrice, maxPrice, search,
                PageRequest.of(page, size, sort));
        return PageResponse.from(results.map(e -> mapToResponse(e, null)));
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getNearbyEquipment(double lat, double lng, double radiusKm) {
        return equipmentRepository.findNearbyEquipment(lat, lng, radiusKm)
                .stream()
                .map(e -> {
                    double dist = calculateDistance(lat, lng,
                            e.getLatitude() != null ? e.getLatitude() : 0,
                            e.getLongitude() != null ? e.getLongitude() : 0);
                    return mapToResponse(e, dist);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(UUID id) {
        Equipment equipment = equipmentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id.toString()));
        return mapToResponse(equipment, null);
    }

    @Transactional
    public EquipmentResponse adminApprove(UUID equipmentId, String adminNote) {
        Equipment equipment = equipmentRepository.findByIdAndDeletedAtIsNull(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
        equipment.setStatus(Equipment.EquipmentStatus.APPROVED);
        equipment.setAdminNote(adminNote);
        equipment = equipmentRepository.save(equipment);

        notificationService.send(
                equipment.getOwner(),
                "Listing Approved!",
                "Your listing '" + equipment.getTitle() + "' is now live on the marketplace.",
                Notification.NotificationType.LISTING_APPROVED,
                equipment.getId().toString());

        return mapToResponse(equipment, null);
    }

    @Transactional
    public EquipmentResponse adminReject(UUID equipmentId, String reason) {
        Equipment equipment = equipmentRepository.findByIdAndDeletedAtIsNull(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
        equipment.setStatus(Equipment.EquipmentStatus.REJECTED);
        equipment.setAdminNote(reason);
        equipment = equipmentRepository.save(equipment);

        notificationService.send(
                equipment.getOwner(),
                "Listing Rejected",
                "Your listing '" + equipment.getTitle() + "' was rejected. Reason: " + reason,
                Notification.NotificationType.LISTING_REJECTED,
                equipment.getId().toString());

        return mapToResponse(equipment, null);
    }

    @Transactional(readOnly = true)
    public PageResponse<EquipmentResponse> getPendingApprovals(int page, int size) {
        Page<Equipment> pending = equipmentRepository.findByStatusAndDeletedAtIsNull(
                Equipment.EquipmentStatus.PENDING_APPROVAL,
                PageRequest.of(page, size, Sort.by("createdAt").ascending()));
        return PageResponse.from(pending.map(e -> mapToResponse(e, null)));
    }

    private void validateOwnerSubscription(User owner) {
        boolean hasActive = subscriptionRepository.findByOwnerAndActiveTrue(owner).isPresent();
        if (!hasActive) {
            throw new ForbiddenException(
                    "Active subscription required to create equipment listings");
        }
    }

    private Equipment getEquipmentForOwner(UUID equipmentId, UUID ownerId) {
        Equipment equipment = equipmentRepository.findByIdAndDeletedAtIsNull(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
        if (!equipment.getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("You don't have permission to modify this listing");
        }
        return equipment;
    }

    private void notifyAdmins(Equipment equipment) {
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.ADMIN)
                .forEach(admin -> notificationService.send(
                        admin,
                        "New Listing Pending Approval",
                        "'" + equipment.getTitle() + "' by "
                                + equipment.getOwner().getFullName()
                                + " needs review.",
                        Notification.NotificationType.SYSTEM,
                        equipment.getId().toString()));
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) return Sort.by("createdAt").descending();
        return switch (sortBy) {
            case "price_asc" -> Sort.by("pricePerDay").ascending();
            case "price_desc" -> Sort.by("pricePerDay").descending();
            case "rating_asc" -> Sort.by("averageRating").ascending();
            case "rating_desc" -> Sort.by("averageRating").descending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("createdAt").descending();
        };
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDist = Math.toRadians(lat2 - lat1);
        double lonDist = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDist / 2) * Math.sin(latDist / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDist / 2) * Math.sin(lonDist / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private EquipmentResponse mapToResponse(Equipment e, Double distanceKm) {
        List<EquipmentResponse.ImageResponse> images = e.getImages().stream()
                .map(img -> EquipmentResponse.ImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .thumbnailUrl(img.getThumbnailUrl())
                        .sortOrder(img.getSortOrder())
                        .isPrimary(img.isPrimary())
                        .build())
                .collect(Collectors.toList());

        return EquipmentResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .category(e.getCategory())
                .brand(e.getBrand())
                .fuelType(e.getFuelType())
                .modelNumber(e.getModelNumber())
                .pricePerHour(e.getPricePerHour())
                .pricePerDay(e.getPricePerDay())
                .depositAmount(e.getDepositAmount())
                .minRentalDurationHours(e.getMinRentalDurationHours())
                .state(e.getState())
                .district(e.getDistrict())
                .village(e.getVillage())
                .address(e.getAddress())
                .latitude(e.getLatitude())
                .longitude(e.getLongitude())
                .status(e.getStatus())
                .availabilityStatus(e.getAvailabilityStatus())
                .adminNote(e.getAdminNote())
                .availableFrom(e.getAvailableFrom())
                .availableTo(e.getAvailableTo())
                .specifications(e.getSpecifications())
                .featured(e.isFeatured())
                .averageRating(e.getAverageRating())
                .totalReviews(e.getTotalReviews())
                .totalBookings(e.getTotalBookings())
                .images(images)
                .owner(EquipmentResponse.OwnerSummary.builder()
                        .id(e.getOwner().getId())
                        .fullName(e.getOwner().getFullName())
                        .profilePhotoUrl(e.getOwner().getProfilePhotoUrl())
                        .district(e.getOwner().getDistrict())
                        .state(e.getOwner().getState())
                        .build())
                .createdAt(e.getCreatedAt())
                .distanceKm(distanceKm)
                .build();
    }
}
