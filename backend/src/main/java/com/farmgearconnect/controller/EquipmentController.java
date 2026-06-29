package com.farmgearconnect.controller;

import com.farmgearconnect.dto.request.EquipmentPatchRequest;
import com.farmgearconnect.dto.request.EquipmentRequest;
import com.farmgearconnect.dto.response.EquipmentResponse;
import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.entity.Equipment;
import com.farmgearconnect.security.UserPrincipal;
import com.farmgearconnect.service.EquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Equipment", description = "Equipment listing management")
@SecurityRequirement(name = "bearerAuth")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @PostMapping("/owner/equipment")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Create equipment listing (draft)")
    public ResponseEntity<EquipmentResponse> create(
            @Valid @RequestBody EquipmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(equipmentService.createListing(principal.getId(), request));
    }

    @PostMapping(value = "/owner/equipment/{id}/images",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Upload equipment images")
    public ResponseEntity<EquipmentResponse> uploadImages(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                equipmentService.addImages(id, principal.getId(), files));
    }

    @PostMapping("/owner/equipment/{id}/submit")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Submit listing for admin approval")
    public ResponseEntity<EquipmentResponse> submit(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                equipmentService.submitForApproval(id, principal.getId()));
    }

    @PutMapping("/owner/equipment/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update equipment listing")
    public ResponseEntity<EquipmentResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody EquipmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                equipmentService.updateListing(id, principal.getId(), request));
    }

    @PatchMapping("/owner/equipment/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Partial update: prices and availability status (no re-approval needed)")
    public ResponseEntity<EquipmentResponse> patch(
            @PathVariable UUID id,
            @RequestBody EquipmentPatchRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                equipmentService.patchListing(id, principal.getId(), request));
    }

    @DeleteMapping("/owner/equipment/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Delete equipment listing (soft delete)")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        equipmentService.deleteListing(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/owner/equipment")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Get owner's own listings")
    public ResponseEntity<PageResponse<EquipmentResponse>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                equipmentService.getOwnerListings(principal.getId(), page, size));
    }

    @GetMapping("/equipment/{id}")
    @Operation(summary = "Get equipment detail by ID (public)")
    public ResponseEntity<EquipmentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @GetMapping("/marketplace")
    @Operation(summary = "Search marketplace (public)")
    public ResponseEntity<PageResponse<EquipmentResponse>> search(
            @RequestParam(required = false) Equipment.EquipmentCategory category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Equipment.FuelType fuelType,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(equipmentService.searchMarketplace(
                category, brand, fuelType, state, district,
                minPrice, maxPrice, search, sortBy, page, size));
    }

    @GetMapping("/marketplace/nearby")
    @Operation(summary = "Find nearby equipment by GPS coordinates (public)")
    public ResponseEntity<List<EquipmentResponse>> getNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "50") double radiusKm) {
        return ResponseEntity.ok(
                equipmentService.getNearbyEquipment(lat, lng, radiusKm));
    }

    @PostMapping("/admin/equipment/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Approve equipment listing")
    public ResponseEntity<EquipmentResponse> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(equipmentService.adminApprove(id, note));
    }

    @PostMapping("/admin/equipment/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Reject equipment listing")
    public ResponseEntity<EquipmentResponse> reject(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                equipmentService.adminReject(id, body.get("reason")));
    }

    @GetMapping("/admin/equipment/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Get pending approval listings")
    public ResponseEntity<PageResponse<EquipmentResponse>> getPending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(equipmentService.getPendingApprovals(page, size));
    }
}
