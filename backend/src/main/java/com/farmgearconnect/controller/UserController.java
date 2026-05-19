package com.farmgearconnect.controller;

import com.farmgearconnect.entity.OtpVerification;
import com.farmgearconnect.entity.User;
import com.farmgearconnect.exception.BadRequestException;
import com.farmgearconnect.exception.DuplicateResourceException;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.repository.UserRepository;
import com.farmgearconnect.security.UserPrincipal;
import com.farmgearconnect.service.AuthService;
import com.farmgearconnect.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Profile management for all roles")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserRepository userRepository;
    private final StorageService storageService;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(toMap(user));
    }

    @PatchMapping("/users/me")
    @Operation(summary = "Update profile fields")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (body.containsKey("fullName") && !body.get("fullName").isBlank())
            user.setFullName(body.get("fullName"));
        if (body.containsKey("phone"))
            user.setPhone(body.get("phone").isBlank() ? null : body.get("phone"));
        if (body.containsKey("state"))
            user.setState(body.get("state").isBlank() ? null : body.get("state"));
        if (body.containsKey("district"))
            user.setDistrict(body.get("district").isBlank() ? null : body.get("district"));
        if (body.containsKey("village"))
            user.setVillage(body.get("village").isBlank() ? null : body.get("village"));
        if (body.containsKey("preferredLanguage")) {
            try {
                user.setPreferredLanguage(
                        User.Language.valueOf(body.get("preferredLanguage").toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        userRepository.save(user);
        return ResponseEntity.ok(toMap(user));
    }

    @PostMapping(value = "/users/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile photo (PNG / JPG only, max 10 MB)")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String url;
        try {
            url = storageService.uploadProfilePhoto(file, user.getId());
        } catch (Exception minioUnavailable) {
            try {
                String mime = file.getContentType() != null ? file.getContentType() : "image/jpeg";
                String b64 = Base64.getEncoder().encodeToString(file.getBytes());
                url = "data:" + mime + ";base64," + b64;
            } catch (Exception e) {
                throw new BadRequestException("Failed to process image: " + e.getMessage());
            }
        }

        user.setProfilePhotoUrl(url);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("profilePhotoUrl", url));
    }

    @PostMapping("/users/me/change-password")
    @Operation(summary = "Change password (requires current password)")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String currentPassword = body.get("currentPassword");
        String newPassword     = body.get("newPassword");

        if (currentPassword == null || newPassword == null)
            throw new BadRequestException("currentPassword and newPassword are required");
        if (newPassword.length() < 8)
            throw new BadRequestException("New password must be at least 8 characters");

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new BadRequestException("Current password is incorrect");

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/users/me/request-email-change")
    @Operation(summary = "Send OTP to a new email address to begin email change")
    public ResponseEntity<Map<String, String>> requestEmailChange(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String newEmail = body.get("newEmail");
        if (newEmail == null || newEmail.isBlank())
            throw new BadRequestException("newEmail is required");
        if (userRepository.existsByEmailAndDeletedAtIsNull(newEmail))
            throw new DuplicateResourceException("Email is already registered to another account");

        authService.sendVerificationOtp(newEmail, OtpVerification.OtpPurpose.EMAIL_VERIFICATION);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + newEmail));
    }

    @PostMapping("/users/me/confirm-email-change")
    @Operation(summary = "Confirm email change with OTP received at the new address")
    public ResponseEntity<Map<String, String>> confirmEmailChange(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String newEmail = body.get("newEmail");
        String otp      = body.get("otp");
        if (newEmail == null || otp == null)
            throw new BadRequestException("newEmail and otp are required");

        authService.verifyEmailChange(principal.getId(), newEmail, otp);
        return ResponseEntity.ok(Map.of("message", "Email changed successfully. Please log in again."));
    }

    private Map<String, Object> toMap(User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",               user.getId().toString());
        m.put("fullName",         user.getFullName());
        m.put("email",            user.getEmail());
        m.put("phone",            user.getPhone()           != null ? user.getPhone()           : "");
        m.put("state",            user.getState()           != null ? user.getState()           : "");
        m.put("district",         user.getDistrict()        != null ? user.getDistrict()        : "");
        m.put("village",          user.getVillage()         != null ? user.getVillage()         : "");
        m.put("profilePhotoUrl",  user.getProfilePhotoUrl() != null ? user.getProfilePhotoUrl() : "");
        m.put("emailVerified",    user.isEmailVerified());
        m.put("preferredLanguage", user.getPreferredLanguage().name());
        return m;
    }
}
