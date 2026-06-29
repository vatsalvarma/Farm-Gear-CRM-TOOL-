package com.farmgearconnect.controller;

import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.entity.AuditLog;
import com.farmgearconnect.entity.Coupon;
import com.farmgearconnect.entity.Notification;
import com.farmgearconnect.entity.User;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.entity.Booking;
import com.farmgearconnect.repository.AuditLogRepository;
import com.farmgearconnect.repository.BookingRepository;
import com.farmgearconnect.repository.CouponRepository;
import com.farmgearconnect.repository.EquipmentRepository;
import com.farmgearconnect.repository.RefreshTokenRepository;
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
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin CRM", description = "Admin control panel")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserRepository         userRepository;
    private final CouponRepository       couponRepository;
    private final BookingRepository      bookingRepository;
    private final EquipmentRepository    equipmentRepository;
    private final AuditLogRepository     auditLogRepository;
    private final NotificationService    notificationService;
    private final RefreshTokenRepository refreshTokenRepository;

    // ─────────────────────────────────────────────────────────────────
    // USER MANAGEMENT
    // ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "List all users with search and role filter")
    public ResponseEntity<PageResponse<User>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) User.UserRole role,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var users = search != null
                ? userRepository.searchUsers(search, pageable)
                : (role != null
                        ? userRepository.findByRoleAndDeletedAtIsNull(role, pageable)
                        : userRepository.findByDeletedAtIsNull(pageable));
        return ResponseEntity.ok(PageResponse.from(users));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get a single user by ID")
    public ResponseEntity<User> getUser(@PathVariable UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(user);
    }

    // ─────────────────────────────────────────────────────────────────
    // BAN / UNBAN
    // ─────────────────────────────────────────────────────────────────

    /**
     * Ban a user.
     * 1. Sets suspended = true (blocks login via UserPrincipal.isAccountNonLocked / isEnabled)
     * 2. Stores the ban reason and timestamp
     * 3. Revokes ALL active refresh-tokens → forces immediate logout from all sessions
     * 4. Sends an in-app notification to the banned user
     * 5. Writes an audit-log entry
     */
    @PatchMapping("/users/{id}/ban")
    @Operation(summary = "Ban a user (auto-logout all sessions)")
    public ResponseEntity<Map<String, String>> banUser(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {

        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String reason = (body != null && body.get("reason") != null)
                ? body.get("reason") : "Violated platform policy";

        user.setSuspended(true);
        user.setSuspensionReason(reason);
        user.setBannedAt(LocalDateTime.now());
        userRepository.save(user);

        // Revoke all refresh tokens → user is logged out from every device
        refreshTokenRepository.revokeAllUserTokens(user);

        // In-app notification
        notificationService.send(
                user,
                "Account Banned",
                "Your account has been banned. Reason: " + reason,
                Notification.NotificationType.SYSTEM,
                null);

        // Audit
        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .action("USER_BANNED")
                .entityType("User")
                .entityId(user.getId().toString())
                .details("Reason: " + reason)
                .build());

        return ResponseEntity.ok(Map.of("message", "User banned and logged out from all sessions"));
    }

    /**
     * Unban a user.
     * Clears the suspension flag and ban metadata, writes an audit entry,
     * and notifies the user that their account has been restored.
     */
    @PatchMapping("/users/{id}/unban")
    @Operation(summary = "Unban a user")
    public ResponseEntity<Map<String, String>> unbanUser(@PathVariable UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setSuspended(false);
        user.setSuspensionReason(null);
        user.setBannedAt(null);
        userRepository.save(user);

        // In-app notification
        notificationService.send(
                user,
                "Account Restored",
                "Your account has been reinstated. You can now log in again.",
                Notification.NotificationType.SYSTEM,
                null);

        // Audit
        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .action("USER_UNBANNED")
                .entityType("User")
                .entityId(user.getId().toString())
                .build());

        return ResponseEntity.ok(Map.of("message", "User unbanned successfully"));
    }

    // ─────────────────────────────────────────────────────────────────
    // BANNED USERS LIST
    // ─────────────────────────────────────────────────────────────────

    @GetMapping("/users/banned")
    @Operation(summary = "List all banned users")
    public ResponseEntity<PageResponse<User>> listBannedUsers(
            @RequestParam(required = false) User.UserRole role,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("bannedAt").descending());
        var users = role != null
                ? userRepository.findBySuspendedTrueAndRoleAndDeletedAtIsNull(role, pageable)
                : userRepository.findBySuspendedTrueAndDeletedAtIsNull(pageable);
        return ResponseEntity.ok(PageResponse.from(users));
    }

    // ─────────────────────────────────────────────────────────────────
    // SOFT DELETE
    // ─────────────────────────────────────────────────────────────────

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Soft-delete a user account")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        userRepository.save(user);

        // Revoke all tokens on deletion as well
        refreshTokenRepository.revokeAllUserTokens(user);

        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .action("USER_DELETED")
                .entityType("User")
                .entityId(user.getId().toString())
                .build());

        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────
    // LEGACY SUSPEND / UNSUSPEND  (kept for backwards-compat)
    // ─────────────────────────────────────────────────────────────────

    @PatchMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend a user (legacy alias for ban)")
    public ResponseEntity<Map<String, String>> suspendUser(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return banUser(id, body);
    }

    @PatchMapping("/users/{id}/unsuspend")
    @Operation(summary = "Unsuspend a user (legacy alias for unban)")
    public ResponseEntity<Map<String, String>> unsuspendUser(@PathVariable UUID id) {
        return unbanUser(id);
    }

    // ─────────────────────────────────────────────────────────────────
    // COUPONS
    // ─────────────────────────────────────────────────────────────────

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
            @RequestParam(defaultValue = "0")  int page,
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

    // ─────────────────────────────────────────────────────────────────
    // NOTIFICATIONS & ANALYTICS
    // ─────────────────────────────────────────────────────────────────

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
                "totalUsers",        userRepository.countActiveUsers(),
                "totalFarmers",      userRepository.countByRole(User.UserRole.FARMER),
                "totalOwners",       userRepository.countByRole(User.UserRole.OWNER),
                "totalBanned",       userRepository.countBannedUsers(),
                "pendingApprovals",  equipmentRepository.countByStatus(
                        com.farmgearconnect.entity.Equipment.EquipmentStatus.PENDING_APPROVAL),
                "totalEquipment",    equipmentRepository.count(),
                "totalBookings",     bookingRepository.count(),
                "completedBookings", bookingRepository.countByStatus(
                        com.farmgearconnect.entity.Booking.BookingStatus.COMPLETED),
                "totalRevenue",      BigDecimal.ZERO
        ));
    }

    @GetMapping("/bookings")
    @Operation(summary = "List all bookings")
    public ResponseEntity<PageResponse<Booking>> listBookings(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(PageResponse.from(bookingRepository.findAll(pageable)));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs")
    public ResponseEntity<PageResponse<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        var logs = auditLogRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size));
        return ResponseEntity.ok(PageResponse.from(logs));
    }
}
