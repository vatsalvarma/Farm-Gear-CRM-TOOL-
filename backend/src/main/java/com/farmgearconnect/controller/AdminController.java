package com.farmgearconnect.controller;

import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.entity.AuditLog;
import com.farmgearconnect.entity.Coupon;
import com.farmgearconnect.entity.User;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.entity.Booking;
import com.farmgearconnect.repository.AuditLogRepository;
import com.farmgearconnect.repository.BookingRepository;
import com.farmgearconnect.repository.CouponRepository;
import com.farmgearconnect.repository.EquipmentRepository;
import com.farmgearconnect.repository.UserRepository;
import com.farmgearconnect.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin CRM", description = "Admin control panel")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    @GetMapping("/users")
    @Operation(summary = "List all users with search")
    public ResponseEntity<PageResponse<User>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) User.UserRole role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var users = search != null
                ? userRepository.searchUsers(search, pageable)
                : (role != null
                        ? userRepository.findByRoleAndDeletedAtIsNull(role, pageable)
                        : userRepository.findByDeletedAtIsNull(pageable));
        return ResponseEntity.ok(PageResponse.from(users));
    }

    @PatchMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend a user")
    public ResponseEntity<Map<String, String>> suspendUser(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setSuspended(true);
        user.setSuspensionReason(body.get("reason"));
        userRepository.save(user);
        notificationService.send(user, "Account Suspended",
                "Your account has been suspended. Reason: " + body.get("reason"),
                com.farmgearconnect.entity.Notification.NotificationType.SYSTEM, null);
        return ResponseEntity.ok(Map.of("message", "User suspended"));
    }

    @PatchMapping("/users/{id}/unsuspend")
    @Operation(summary = "Unsuspend a user")
    public ResponseEntity<Map<String, String>> unsuspendUser(@PathVariable UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setSuspended(false);
        user.setSuspensionReason(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User unsuspended"));
    }

    @PostMapping("/coupons")
    @Operation(summary = "Create coupon")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        coupon.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponRepository.save(coupon));
    }

    @GetMapping("/coupons")
    @Operation(summary = "List active coupons")
    public ResponseEntity<PageResponse<Coupon>> listCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var coupons = couponRepository.findByActiveTrueOrderByCreatedAtDesc(
                PageRequest.of(page, size));
        return ResponseEntity.ok(PageResponse.from(coupons));
    }

    @DeleteMapping("/coupons/{id}")
    @Operation(summary = "Deactivate coupon")
    public ResponseEntity<Void> deactivateCoupon(@PathVariable UUID id) {
        couponRepository.findById(id).ifPresent(c -> {
            c.setActive(false);
            couponRepository.save(c);
        });
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/broadcast")
    @Operation(summary = "Broadcast notification to all users")
    public ResponseEntity<Map<String, String>> broadcast(
            @RequestBody Map<String, String> body) {
        String msg = body.get("message") != null ? body.get("message") : body.get("body");
        notificationService.broadcastToAll(body.get("title"), msg);
        return ResponseEntity.ok(Map.of("message", "Broadcast sent"));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Platform analytics summary")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(Map.of(
                "totalUsers",       userRepository.countActiveUsers(),
                "totalFarmers",     userRepository.countByRole(User.UserRole.FARMER),
                "totalOwners",      userRepository.countByRole(User.UserRole.OWNER),
                "pendingApprovals", equipmentRepository.countByStatus(
                        com.farmgearconnect.entity.Equipment.EquipmentStatus.PENDING_APPROVAL),
                "totalEquipment",   equipmentRepository.count(),
                "totalBookings",    bookingRepository.count(),
                "completedBookings", bookingRepository.countByStatus(
                        com.farmgearconnect.entity.Booking.BookingStatus.COMPLETED),
                "totalRevenue",     BigDecimal.ZERO
        ));
    }

    @GetMapping("/bookings")
    @Operation(summary = "List all bookings")
    public ResponseEntity<PageResponse<Booking>> listBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(PageResponse.from(bookingRepository.findAll(pageable)));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs")
    public ResponseEntity<PageResponse<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        var logs = auditLogRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size));
        return ResponseEntity.ok(PageResponse.from(logs));
    }
}
