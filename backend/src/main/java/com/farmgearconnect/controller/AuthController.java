package com.farmgearconnect.controller;

import com.farmgearconnect.dto.request.LoginRequest;
import com.farmgearconnect.dto.request.OAuthRequest;
import com.farmgearconnect.dto.request.RegisterRequest;
import com.farmgearconnect.dto.response.AuthResponse;
import com.farmgearconnect.entity.OtpVerification;
import com.farmgearconnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, OTP, password reset")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user (FARMER or OWNER)")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request, ip));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, getClientIp(httpRequest)));
    }

    @PostMapping("/oauth")
    @Operation(summary = "OAuth 2.0 login / auto-registration via Google or GitHub")
    public ResponseEntity<AuthResponse> oauthLogin(
            @Valid @RequestBody OAuthRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.oauthLogin(request, getClientIp(httpRequest)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody Map<String, String> body,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(
                authService.refreshToken(body.get("refreshToken"), getClientIp(httpRequest)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke refresh token")
    public ResponseEntity<Void> logout(@RequestBody Map<String, String> body) {
        authService.logout(body.get("refreshToken"));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email with OTP")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @RequestBody Map<String, String> body) {
        authService.verifyEmail(body.get("email"), body.get("otp"));
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend email verification OTP")
    public ResponseEntity<Map<String, String>> resendOtp(
            @RequestBody Map<String, String> body) {
        authService.sendVerificationOtp(body.get("email"),
                OtpVerification.OtpPurpose.EMAIL_VERIFICATION);
        return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset OTP")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(Map.of("message",
                "If this email exists, a reset OTP has been sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using OTP")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> body) {
        authService.resetPassword(
                body.get("email"), body.get("otp"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return xff != null ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
