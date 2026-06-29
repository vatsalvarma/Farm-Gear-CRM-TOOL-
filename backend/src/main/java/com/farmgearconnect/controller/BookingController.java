package com.farmgearconnect.controller;

import com.farmgearconnect.dto.request.BookingRequest;
import com.farmgearconnect.dto.response.BookingResponse;
import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.entity.Booking;
import com.farmgearconnect.security.UserPrincipal;
import com.farmgearconnect.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Equipment booking workflow")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/farmer/bookings")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Create booking request")
    public ResponseEntity<BookingResponse> create(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(principal.getId(), request));
    }

    @GetMapping("/farmer/bookings")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Get farmer's bookings")
    public ResponseEntity<PageResponse<BookingResponse>> getFarmerBookings(
            @RequestParam(required = false) Booking.BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                bookingService.getFarmerBookings(principal.getId(), status, page, size));
    }

    @GetMapping("/owner/bookings")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Get owner's bookings (optionally filtered by equipmentId)")
    public ResponseEntity<PageResponse<BookingResponse>> getOwnerBookings(
            @RequestParam(required = false) Booking.BookingStatus status,
            @RequestParam(required = false) UUID equipmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (equipmentId != null) {
            return ResponseEntity.ok(
                    bookingService.getBookingsByEquipment(
                            principal.getId(), equipmentId, page, size));
        }
        return ResponseEntity.ok(
                bookingService.getOwnerBookings(principal.getId(), status, page, size));
    }

    @PostMapping("/owner/bookings/{id}/approve")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Approve booking")
    public ResponseEntity<BookingResponse> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(
                bookingService.approveBooking(id, principal.getId(), note));
    }

    @PostMapping("/owner/bookings/{id}/reject")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Reject booking")
    public ResponseEntity<BookingResponse> reject(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                bookingService.rejectBooking(id, principal.getId(), body.get("reason")));
    }

    @PostMapping("/owner/bookings/{id}/complete")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Mark booking as completed")
    public ResponseEntity<BookingResponse> complete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                bookingService.completeBooking(id, principal.getId()));
    }

    @PostMapping("/bookings/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel booking (farmer or owner)")
    public ResponseEntity<BookingResponse> cancel(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                bookingService.cancelBooking(id, principal.getId()));
    }

    @GetMapping("/owner/earnings")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Get total earnings")
    public ResponseEntity<Map<String, BigDecimal>> getEarnings(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("totalEarnings",
                bookingService.getTotalEarnings(principal.getId())));
    }
}
