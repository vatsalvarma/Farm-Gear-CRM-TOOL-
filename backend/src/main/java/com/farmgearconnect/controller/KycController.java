package com.farmgearconnect.controller;

import com.farmgearconnect.entity.Notification;
import com.farmgearconnect.entity.User;
import com.farmgearconnect.entity.UserKyc;
import com.farmgearconnect.exception.BadRequestException;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.repository.NotificationRepository;
import com.farmgearconnect.repository.UserKycRepository;
import com.farmgearconnect.repository.UserRepository;
import com.farmgearconnect.security.UserPrincipal;
import com.farmgearconnect.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/kyc")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "KYC", description = "KYC profile completion & verification")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class KycController {

    private final UserKycRepository kycRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final NotificationRepository notificationRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /kyc/me — current user's KYC record
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/me")
    @Operation(summary = "Get my KYC record")
    public ResponseEntity<Map<String, Object>> getMyKyc(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal.getId());
        Optional<UserKyc> kyc = kycRepository.findByUserId(user.getId());
        return ResponseEntity.ok(buildKycResponse(user, kyc.orElse(null)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /kyc/me — save/update KYC text fields (no files yet)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/me")
    @Operation(summary = "Submit or update KYC profile details")
    public ResponseEntity<Map<String, Object>> saveKyc(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {

        User user = getUser(principal.getId());
        UserKyc kyc = kycRepository.findByUserId(user.getId())
                .orElse(UserKyc.builder().user(user).build());

        // Reject editing if already APPROVED
        if (kyc.getKycStatus() == UserKyc.KycStatus.APPROVED) {
            throw new BadRequestException("KYC already approved. Contact admin to make changes.");
        }

        // Apply text fields
        applyTextFields(kyc, body);

        // Update user phone & location from KYC form
        if (body.containsKey("phone") && !body.get("phone").isBlank())
            user.setPhone(body.get("phone"));
        if (body.containsKey("state") && !body.get("state").isBlank())
            user.setState(body.get("state"));
        if (body.containsKey("district") && !body.get("district").isBlank())
            user.setDistrict(body.get("district"));
        if (body.containsKey("village") && !body.get("village").isBlank())
            user.setVillage(body.get("village"));
        userRepository.save(user);

        kycRepository.save(kyc);
        return ResponseEntity.ok(buildKycResponse(user, kyc));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /kyc/me/submit — mark as SUBMITTED for admin review
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/me/submit")
    @Operation(summary = "Submit KYC for admin review")
    public ResponseEntity<Map<String, Object>> submitKyc(
            @AuthenticationPrincipal UserPrincipal principal) {

        User user = getUser(principal.getId());
        UserKyc kyc = kycRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Please save KYC details first"));

        if (kyc.getKycStatus() == UserKyc.KycStatus.APPROVED) {
            throw new BadRequestException("KYC already approved.");
        }
        if (kyc.getKycStatus() == UserKyc.KycStatus.SUBMITTED) {
            throw new BadRequestException("KYC already submitted and awaiting review.");
        }

        kyc.setKycStatus(UserKyc.KycStatus.SUBMITTED);
        kyc.setSubmittedAt(LocalDateTime.now());
        kycRepository.save(kyc);

        // Notify admin(s)
        List<User> admins = userRepository.findByRoleAndDeletedAtIsNull(User.UserRole.ADMIN, PageRequest.of(0, 10)).getContent();
        for (User admin : admins) {
            notificationRepository.save(Notification.builder()
                    .user(admin)
                    .title("KYC Submitted")
                    .body(user.getFullName() + " (" + user.getRole().name() + ") has submitted KYC for review.")
                    .type(Notification.NotificationType.KYC_SUBMITTED)
                    .referenceId(user.getId().toString())
                    .build());
        }

        return ResponseEntity.ok(Map.of("message", "KYC submitted for review", "status", "SUBMITTED"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /kyc/me/upload/{docType} — upload a document image
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping(value = "/me/upload/{docType}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload KYC document image. docType: AADHAAR_FRONT | AADHAAR_BACK | PAN | PASSBOOK | COMPANY | PROFILE")
    public ResponseEntity<Map<String, String>> uploadDoc(
            @PathVariable String docType,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {

        User user = getUser(principal.getId());
        UserKyc kyc = kycRepository.findByUserId(user.getId())
                .orElse(UserKyc.builder().user(user).build());

        if (kyc.getKycStatus() == UserKyc.KycStatus.APPROVED) {
            throw new BadRequestException("KYC already approved. Cannot re-upload.");
        }

        String dataUri = storageService.uploadDocument(file, user.getId());
        String fieldName = applyDocumentUpload(kyc, docType.toUpperCase(), dataUri, user);

        kycRepository.save(kyc);
        return ResponseEntity.ok(Map.of("field", fieldName, "message", "Document uploaded successfully"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: GET /kyc/admin/pending — list pending/submitted KYC records
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/admin/list")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: list all KYC records with optional status filter")
    public ResponseEntity<List<Map<String, Object>>> adminListKyc(
            @RequestParam(required = false) String status) {

        List<UserKyc> records;
        if (status != null && !status.isBlank()) {
            try {
                UserKyc.KycStatus s = UserKyc.KycStatus.valueOf(status.toUpperCase());
                records = kycRepository.findAll().stream()
                        .filter(k -> k.getKycStatus() == s).toList();
            } catch (IllegalArgumentException e) {
                records = kycRepository.findAll();
            }
        } else {
            records = kycRepository.findAll();
        }

        List<Map<String, Object>> result = records.stream()
                .map(k -> buildKycResponse(k.getUser(), k))
                .toList();
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: GET /kyc/admin/user/{userId} — get KYC for specific user
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/admin/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: get KYC details for a specific user")
    public ResponseEntity<Map<String, Object>> adminGetUserKyc(@PathVariable UUID userId) {
        User user = getUser(userId);
        Optional<UserKyc> kyc = kycRepository.findByUserId(userId);
        return ResponseEntity.ok(buildKycResponse(user, kyc.orElse(null)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: PATCH /kyc/admin/user/{userId}/approve — approve KYC
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/admin/user/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: approve KYC")
    public ResponseEntity<Map<String, Object>> approveKyc(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        User user = getUser(userId);
        UserKyc kyc = kycRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC record not found"));

        kyc.setKycStatus(UserKyc.KycStatus.APPROVED);
        kyc.setReviewedAt(LocalDateTime.now());
        kyc.setReviewedBy(adminPrincipal.getId().toString());
        kyc.setRejectionReason(null);
        kycRepository.save(kyc);

        user.setKycCompleted(true);
        userRepository.save(user);

        // Notify user
        notificationRepository.save(Notification.builder()
                .user(user)
                .title("KYC Approved ✅")
                .body("Your KYC verification has been approved. You now have full access to FarmGear Connect.")
                .type(Notification.NotificationType.KYC_APPROVED)
                .referenceId(kyc.getId().toString())
                .build());

        return ResponseEntity.ok(Map.of("message", "KYC approved", "status", "APPROVED"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: PATCH /kyc/admin/user/{userId}/reject — reject KYC
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/admin/user/{userId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: reject KYC with reason")
    public ResponseEntity<Map<String, Object>> rejectKyc(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        String reason = body.getOrDefault("reason", "Documents need correction");
        User user = getUser(userId);
        UserKyc kyc = kycRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC record not found"));

        kyc.setKycStatus(UserKyc.KycStatus.REJECTED);
        kyc.setReviewedAt(LocalDateTime.now());
        kyc.setReviewedBy(adminPrincipal.getId().toString());
        kyc.setRejectionReason(reason);
        kycRepository.save(kyc);

        user.setKycCompleted(false);
        userRepository.save(user);

        // Notify user
        notificationRepository.save(Notification.builder()
                .user(user)
                .title("KYC Rejected ❌")
                .body("Your KYC was rejected. Reason: " + reason + ". Please update and resubmit.")
                .type(Notification.NotificationType.KYC_REJECTED)
                .referenceId(kyc.getId().toString())
                .build());

        return ResponseEntity.ok(Map.of("message", "KYC rejected", "status", "REJECTED"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OWNER: GET /kyc/owner/farmer/{farmerId} — view farmer KYC (for bookings)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/owner/farmer/{farmerId}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Owner: view farmer KYC details (for their bookings)")
    public ResponseEntity<Map<String, Object>> ownerViewFarmerKyc(@PathVariable UUID farmerId) {
        User farmer = getUser(farmerId);
        if (farmer.getRole() != User.UserRole.FARMER) {
            throw new BadRequestException("User is not a farmer");
        }
        Optional<UserKyc> kyc = kycRepository.findByUserId(farmerId);
        Map<String, Object> resp = buildKycResponse(farmer, kyc.orElse(null));
        // Mask sensitive fields for owner
        resp.remove("aadhaarFrontUrl");
        resp.remove("aadhaarBackUrl");
        resp.remove("panCardUrl");
        resp.remove("passbookUrl");
        resp.remove("bankAccountNumber");
        return ResponseEntity.ok(resp);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private User getUser(UUID id) {
        return userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void applyTextFields(UserKyc kyc, Map<String, String> body) {
        if (body.containsKey("address")) kyc.setAddress(body.get("address"));
        if (body.containsKey("pincode")) kyc.setPincode(body.get("pincode"));
        if (body.containsKey("mandal")) kyc.setMandal(body.get("mandal"));
        if (body.containsKey("aadhaarNumber")) kyc.setAadhaarNumber(body.get("aadhaarNumber"));
        if (body.containsKey("panNumber")) kyc.setPanNumber(body.get("panNumber"));
        if (body.containsKey("bankAccountHolderName")) kyc.setBankAccountHolderName(body.get("bankAccountHolderName"));
        if (body.containsKey("bankAccountNumber")) kyc.setBankAccountNumber(body.get("bankAccountNumber"));
        if (body.containsKey("ifscCode")) kyc.setIfscCode(body.get("ifscCode"));
        if (body.containsKey("bankName")) kyc.setBankName(body.get("bankName"));
        if (body.containsKey("companyName")) kyc.setCompanyName(body.get("companyName"));
        if (body.containsKey("gstNumber")) kyc.setGstNumber(body.get("gstNumber"));
        if (body.containsKey("businessAddress")) kyc.setBusinessAddress(body.get("businessAddress"));

        // Reset status to PENDING if user is editing after rejection
        if (kyc.getKycStatus() == UserKyc.KycStatus.REJECTED) {
            kyc.setKycStatus(UserKyc.KycStatus.PENDING);
        }
    }

    private String applyDocumentUpload(UserKyc kyc, String docType, String dataUri, User user) {
        return switch (docType) {
            case "AADHAAR_FRONT" -> { kyc.setAadhaarFrontUrl(dataUri); yield "aadhaarFrontUrl"; }
            case "AADHAAR_BACK"  -> { kyc.setAadhaarBackUrl(dataUri);  yield "aadhaarBackUrl"; }
            case "PAN"           -> { kyc.setPanCardUrl(dataUri);       yield "panCardUrl"; }
            case "PASSBOOK"      -> { kyc.setPassbookUrl(dataUri);      yield "passbookUrl"; }
            case "COMPANY"       -> { kyc.setCompanyDocUrl(dataUri);    yield "companyDocUrl"; }
            case "PROFILE"       -> {
                user.setProfilePhotoUrl(dataUri);
                userRepository.save(user);
                yield "profilePhotoUrl";
            }
            default -> throw new BadRequestException(
                "Invalid docType: " + docType + ". Use AADHAAR_FRONT, AADHAAR_BACK, PAN, PASSBOOK, COMPANY, PROFILE");
        };
    }

    private Map<String, Object> buildKycResponse(User user, UserKyc kyc) {
        Map<String, Object> m = new LinkedHashMap<>();

        // User basics
        m.put("userId",          user.getId().toString());
        m.put("fullName",        user.getFullName());
        m.put("email",           user.getEmail());
        m.put("phone",           user.getPhone());
        m.put("role",            user.getRole().name());
        m.put("profilePhotoUrl", user.getProfilePhotoUrl());
        m.put("state",           user.getState());
        m.put("district",        user.getDistrict());
        m.put("village",         user.getVillage());
        m.put("kycCompleted",    user.isKycCompleted());

        if (kyc == null) {
            m.put("kycStatus", "NOT_STARTED");
            m.put("kycId", null);
            return m;
        }

        m.put("kycId",                  kyc.getId().toString());
        m.put("kycStatus",              kyc.getKycStatus().name());
        m.put("rejectionReason",        kyc.getRejectionReason());
        m.put("submittedAt",            kyc.getSubmittedAt());
        m.put("reviewedAt",             kyc.getReviewedAt());

        // Address
        m.put("address",                kyc.getAddress());
        m.put("pincode",                kyc.getPincode());
        m.put("mandal",                 kyc.getMandal());

        // Identity
        m.put("aadhaarNumber",          kyc.getAadhaarNumber());
        m.put("panNumber",              kyc.getPanNumber());

        // Bank
        m.put("bankAccountHolderName",  kyc.getBankAccountHolderName());
        m.put("bankAccountNumber",      kyc.getBankAccountNumber());
        m.put("ifscCode",               kyc.getIfscCode());
        m.put("bankName",               kyc.getBankName());

        // Owner extras
        m.put("companyName",            kyc.getCompanyName());
        m.put("gstNumber",              kyc.getGstNumber());
        m.put("businessAddress",        kyc.getBusinessAddress());

        // Document images
        m.put("aadhaarFrontUrl",        kyc.getAadhaarFrontUrl() != null ? "[uploaded]" : null);
        m.put("aadhaarBackUrl",         kyc.getAadhaarBackUrl()  != null ? "[uploaded]" : null);
        m.put("panCardUrl",             kyc.getPanCardUrl()      != null ? "[uploaded]" : null);
        m.put("passbookUrl",            kyc.getPassbookUrl()     != null ? "[uploaded]" : null);
        m.put("companyDocUrl",          kyc.getCompanyDocUrl()   != null ? "[uploaded]" : null);

        // Actual image data (for admin view — these are the full data URIs)
        m.put("aadhaarFrontData",       kyc.getAadhaarFrontUrl());
        m.put("aadhaarBackData",        kyc.getAadhaarBackUrl());
        m.put("panCardData",            kyc.getPanCardUrl());
        m.put("passbookData",           kyc.getPassbookUrl());
        m.put("companyDocData",         kyc.getCompanyDocUrl());

        return m;
    }
}
