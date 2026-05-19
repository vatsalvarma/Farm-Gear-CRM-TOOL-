package com.farmgearconnect.service;

import com.farmgearconnect.dto.request.BookingRequest;
import com.farmgearconnect.dto.response.BookingResponse;
import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.entity.*;
import com.farmgearconnect.exception.BadRequestException;
import com.farmgearconnect.exception.ForbiddenException;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public BookingResponse createBooking(UUID farmerId, BookingRequest request) {
        User farmer = userRepository.findByIdAndDeletedAtIsNull(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));

        Equipment equipment = equipmentRepository
                .findByIdAndDeletedAtIsNull(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        if (equipment.getStatus() != Equipment.EquipmentStatus.APPROVED) {
            throw new BadRequestException("Equipment is not available for booking");
        }

        if (equipment.getOwner().getId().equals(farmerId)) {
            throw new BadRequestException("You cannot book your own equipment");
        }

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        boolean hasConflict = !bookingRepository.findConflictingBookings(
                equipment, request.getStartDate(), request.getEndDate()).isEmpty();
        if (hasConflict) {
            throw new BadRequestException(
                    "Equipment is already booked for the selected dates");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        BigDecimal totalAmount = equipment.getPricePerDay()
                .multiply(BigDecimal.valueOf(days));

        String reference = "FGC-" + System.currentTimeMillis();

        Booking booking = Booking.builder()
                .equipment(equipment)
                .farmer(farmer)
                .owner(equipment.getOwner())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalAmount(totalAmount)
                .depositAmount(equipment.getDepositAmount())
                .farmerNote(request.getFarmerNote())
                .bookingReference(reference)
                .status(Booking.BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);

        notificationService.send(
                equipment.getOwner(),
                "New Booking Request",
                farmer.getFullName() + " requested to rent '" + equipment.getTitle()
                        + "' from " + request.getStartDate() + " to " + request.getEndDate(),
                Notification.NotificationType.BOOKING_REQUEST,
                booking.getId().toString());

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse approveBooking(UUID bookingId, UUID ownerId, String ownerNote) {
        Booking booking = getBookingForOwner(bookingId, ownerId);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setOwnerNote(ownerNote);
        booking.setApprovedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        notificationService.send(
                booking.getFarmer(),
                "Booking Approved!",
                "Your booking for '" + booking.getEquipment().getTitle()
                        + "' (Ref: " + booking.getBookingReference() + ") has been approved.",
                Notification.NotificationType.BOOKING_APPROVED,
                booking.getId().toString());

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse rejectBooking(UUID bookingId, UUID ownerId, String reason) {
        Booking booking = getBookingForOwner(bookingId, ownerId);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setRejectedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        notificationService.send(
                booking.getFarmer(),
                "Booking Rejected",
                "Your booking for '" + booking.getEquipment().getTitle()
                        + "' was rejected. Reason: " + reason,
                Notification.NotificationType.BOOKING_REJECTED,
                booking.getId().toString());

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isFarmer = booking.getFarmer().getId().equals(userId);
        boolean isOwner = booking.getOwner().getId().equals(userId);
        if (!isFarmer && !isOwner) {
            throw new ForbiddenException("You cannot cancel this booking");
        }

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED
                || booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a " + booking.getStatus() + " booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        User notifyUser = isFarmer ? booking.getOwner() : booking.getFarmer();
        notificationService.send(
                notifyUser,
                "Booking Cancelled",
                "Booking " + booking.getBookingReference() + " for '"
                        + booking.getEquipment().getTitle() + "' has been cancelled.",
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId().toString());

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse completeBooking(UUID bookingId, UUID ownerId) {
        Booking booking = getBookingForOwner(bookingId, ownerId);

        if (booking.getStatus() != Booking.BookingStatus.APPROVED
                && booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new BadRequestException("Only approved/active bookings can be completed");
        }

        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());

        Equipment equipment = booking.getEquipment();
        equipment.setTotalBookings(equipment.getTotalBookings() + 1);
        equipmentRepository.save(equipment);

        booking = bookingRepository.save(booking);

        notificationService.send(
                booking.getFarmer(),
                "Booking Completed",
                "Your rental of '" + booking.getEquipment().getTitle()
                        + "' has been marked complete. Please leave a review!",
                Notification.NotificationType.BOOKING_COMPLETED,
                booking.getId().toString());

        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getFarmerBookings(UUID farmerId,
                                                            Booking.BookingStatus status,
                                                            int page, int size) {
        User farmer = userRepository.findByIdAndDeletedAtIsNull(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));
        var paged = status != null
                ? bookingRepository.findByFarmerAndStatusOrderByCreatedAtDesc(
                        farmer, status, PageRequest.of(page, size))
                : bookingRepository.findByFarmerOrderByCreatedAtDesc(
                        farmer, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.from(paged.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getOwnerBookings(UUID ownerId,
                                                           Booking.BookingStatus status,
                                                           int page, int size) {
        User owner = userRepository.findByIdAndDeletedAtIsNull(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        var paged = status != null
                ? bookingRepository.findByOwnerAndStatusOrderByCreatedAtDesc(
                        owner, status, PageRequest.of(page, size))
                : bookingRepository.findByOwnerOrderByCreatedAtDesc(
                        owner, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.from(paged.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalEarnings(UUID ownerId) {
        User owner = userRepository.findByIdAndDeletedAtIsNull(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        return bookingRepository.calculateTotalEarnings(owner);
    }

    private Booking getBookingForOwner(UUID bookingId, UUID ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("You don't have permission to manage this booking");
        }
        return booking;
    }

    private BookingResponse mapToResponse(Booking b) {
        String primaryImage = b.getEquipment().getImages().stream()
                .filter(EquipmentImage::isPrimary)
                .map(EquipmentImage::getImageUrl)
                .findFirst()
                .orElse(b.getEquipment().getImages().isEmpty()
                        ? null : b.getEquipment().getImages().get(0).getImageUrl());

        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .status(b.getStatus())
                .startDate(b.getStartDate())
                .endDate(b.getEndDate())
                .totalAmount(b.getTotalAmount())
                .depositAmount(b.getDepositAmount())
                .farmerNote(b.getFarmerNote())
                .ownerNote(b.getOwnerNote())
                .rejectionReason(b.getRejectionReason())
                .approvedAt(b.getApprovedAt())
                .createdAt(b.getCreatedAt())
                .equipment(BookingResponse.EquipmentSummary.builder()
                        .id(b.getEquipment().getId())
                        .title(b.getEquipment().getTitle())
                        .primaryImageUrl(primaryImage)
                        .district(b.getEquipment().getDistrict())
                        .state(b.getEquipment().getState())
                        .build())
                .farmer(BookingResponse.UserSummary.builder()
                        .id(b.getFarmer().getId())
                        .fullName(b.getFarmer().getFullName())
                        .profilePhotoUrl(b.getFarmer().getProfilePhotoUrl())
                        .build())
                .owner(BookingResponse.UserSummary.builder()
                        .id(b.getOwner().getId())
                        .fullName(b.getOwner().getFullName())
                        .profilePhotoUrl(b.getOwner().getProfilePhotoUrl())
                        .build())
                .build();
    }
}
