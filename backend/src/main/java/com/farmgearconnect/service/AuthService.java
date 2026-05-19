package com.farmgearconnect.service;

import com.farmgearconnect.dto.request.LoginRequest;
import com.farmgearconnect.dto.request.RegisterRequest;
import com.farmgearconnect.dto.response.AuthResponse;
import com.farmgearconnect.entity.*;
import com.farmgearconnect.exception.BadRequestException;
import com.farmgearconnect.exception.DuplicateResourceException;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.exception.UnauthorizedException;
import com.farmgearconnect.repository.*;
import com.farmgearconnect.security.JwtTokenProvider;
import com.farmgearconnect.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CouponRepository couponRepository;
    private final AuditLogRepository auditLogRepository;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.jwt.access-token-expiry}")
    private long accessTokenExpiry;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Value("${app.subscription.free-registrations}")
    private int freeRegistrations;

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (request.getPhone() != null
                && userRepository.existsByPhoneAndDeletedAtIsNull(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .state(request.getState())
                .district(request.getDistrict())
                .village(request.getVillage())
                .preferredLanguage(request.getPreferredLanguage() != null
                        ? request.getPreferredLanguage() : User.Language.ENGLISH)
                .lastLoginIp(ipAddress)
                .build();

        user = userRepository.save(user);

        if (user.getRole() == User.UserRole.OWNER) {
            provisionOwnerSubscription(user, request.getCouponCode());
        }

        sendVerificationOtp(user.getEmail(), OtpVerification.OtpPurpose.EMAIL_VERIFICATION);

        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .action("USER_REGISTERED")
                .entityType("User")
                .entityId(user.getId().toString())
                .ipAddress(ipAddress)
                .build());

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByIdAndDeletedAtIsNull(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(ipAddress);
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .action("USER_LOGIN")
                .entityType("User")
                .entityId(user.getId().toString())
                .ipAddress(ipAddress)
                .details(request.getDeviceInfo())
                .build());

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken, String ipAddress) {
        RefreshToken token = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new UnauthorizedException("Refresh token expired");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);

        return generateAuthResponse(token.getUser());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void sendVerificationOtp(String email, OtpVerification.OtpPurpose purpose) {
        String otp = generateOtp();
        OtpVerification otpRecord = OtpVerification.builder()
                .email(email)
                .otp(passwordEncoder.encode(otp))
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpVerificationRepository.save(otpRecord);
        emailService.sendOtpEmail(email, otp, purpose);
    }

    @Transactional
    public void verifyEmail(String email, String otp) {
        OtpVerification record = otpVerificationRepository
                .findByEmailAndPurposeAndUsedFalseAndExpiresAtAfter(
                        email, OtpVerification.OtpPurpose.EMAIL_VERIFICATION,
                        LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (!passwordEncoder.matches(otp, record.getOtp())) {
            record.setAttempts(record.getAttempts() + 1);
            otpVerificationRepository.save(record);
            throw new BadRequestException("Invalid OTP");
        }

        record.setUsed(true);
        otpVerificationRepository.save(record);

        userRepository.findByEmailAndDeletedAtIsNull(email).ifPresent(user -> {
            user.setEmailVerified(true);
            userRepository.save(user);
        });
    }

    @Transactional
    public void verifyEmailChange(UUID userId, String newEmail, String otp) {
        OtpVerification record = otpVerificationRepository
                .findByEmailAndPurposeAndUsedFalseAndExpiresAtAfter(
                        newEmail, OtpVerification.OtpPurpose.EMAIL_VERIFICATION,
                        LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (!passwordEncoder.matches(otp, record.getOtp())) {
            record.setAttempts(record.getAttempts() + 1);
            otpVerificationRepository.save(record);
            throw new BadRequestException("Invalid OTP");
        }

        record.setUsed(true);
        otpVerificationRepository.save(record);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEmail(newEmail);
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmailAndDeletedAtIsNull(email).ifPresent(user -> {
            sendVerificationOtp(email, OtpVerification.OtpPurpose.PASSWORD_RESET);
        });
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        OtpVerification record = otpVerificationRepository
                .findByEmailAndPurposeAndUsedFalseAndExpiresAtAfter(
                        email, OtpVerification.OtpPurpose.PASSWORD_RESET,
                        LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (!passwordEncoder.matches(otp, record.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        record.setUsed(true);
        otpVerificationRepository.save(record);

        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    private void provisionOwnerSubscription(User owner, String couponCode) {
        long totalOwners = userRepository.countByRole(User.UserRole.OWNER);
        boolean isFree = totalOwners <= freeRegistrations;

        Coupon coupon = null;
        if (!isFree && couponCode != null) {
            coupon = couponRepository
                    .findByCodeAndActiveTrueAndExpiryDateAfter(couponCode, LocalDate.now())
                    .orElse(null);
            if (coupon != null) {
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                if (coupon.getUsedCount() >= coupon.getMaxUses()) {
                    coupon.setActive(false);
                }
                couponRepository.save(coupon);
            }
        }

        Subscription subscription = Subscription.builder()
                .owner(owner)
                .plan(isFree ? Subscription.SubscriptionPlan.FREE_TRIAL
                        : Subscription.SubscriptionPlan.ANNUAL)
                .startDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .active(true)
                .coupon(coupon)
                .amountPaid(isFree ? java.math.BigDecimal.ZERO : null)
                .build();
        subscriptionRepository.save(subscription);
    }

    private AuthResponse generateAuthResponse(User user) {
        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(principal);
        String rawRefreshToken = tokenProvider.generateRefreshToken();

        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(rawRefreshToken)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiry / 1000))
                .build());

        boolean hasActiveSub = user.getRole() == User.UserRole.OWNER
                && subscriptionRepository.findByOwnerAndActiveTrue(user).isPresent();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .expiresIn(accessTokenExpiry / 1000)
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .profilePhotoUrl(user.getProfilePhotoUrl())
                        .emailVerified(user.isEmailVerified())
                        .preferredLanguage(user.getPreferredLanguage().name())
                        .hasActiveSubscription(hasActiveSub)
                        .build())
                .build();
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }
}
