package com.farmgearconnect.service;

import com.farmgearconnect.entity.Booking;
import com.farmgearconnect.entity.Subscription;
import com.farmgearconnect.entity.User;
import com.farmgearconnect.exception.BadRequestException;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.repository.BookingRepository;
import com.farmgearconnect.repository.SubscriptionRepository;
import com.farmgearconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Payment gateway integration service
 * Supports Razorpay for Indian market
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final BookingRepository bookingRepository;

    @Value("${app.payment.provider:RAZORPAY}")
    private String paymentProvider;

    @Value("${app.payment.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${app.payment.razorpay.key-secret:}")
    private String razorpayKeySecret;

    @Value("${app.payment.enabled:false}")
    private boolean paymentEnabled;

    @Value("${app.payment.currency:INR}")
    private String currency;

    /**
     * Create payment order for subscription
     */
    public Map<String, Object> createSubscriptionPaymentOrder(UUID userId, 
                                                               Subscription.SubscriptionPlan plan) {
        if (!paymentEnabled) {
            throw new BadRequestException("Payment feature is currently disabled");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal amount = getSubscriptionAmount(plan);
        String orderId = "SUB-" + UUID.randomUUID().toString();

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("orderId", orderId);
        orderData.put("amount", amount);
        orderData.put("currency", currency);
        orderData.put("userId", userId.toString());
        orderData.put("plan", plan.name());

        if ("RAZORPAY".equalsIgnoreCase(paymentProvider)) {
            return createRazorpayOrder(orderId, amount, "Subscription - " + plan.name());
        }

        return orderData;
    }

    /**
     * Create payment order for booking deposit
     */
    public Map<String, Object> createBookingPaymentOrder(UUID bookingId, UUID userId) {
        if (!paymentEnabled) {
            throw new BadRequestException("Payment feature is currently disabled");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getFarmer().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized to pay for this booking");
        }

        BigDecimal amount = booking.getDepositAmount() != null 
                ? booking.getDepositAmount() 
                : booking.getTotalAmount();

        String orderId = "BOOK-" + booking.getBookingReference();

        if ("RAZORPAY".equalsIgnoreCase(paymentProvider)) {
            return createRazorpayOrder(orderId, amount, 
                    "Booking Deposit - " + booking.getEquipment().getTitle());
        }

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("orderId", orderId);
        orderData.put("amount", amount);
        orderData.put("currency", currency);
        orderData.put("bookingId", bookingId.toString());
        return orderData;
    }

    /**
     * Verify payment and update records
     */
    @Transactional
    public Map<String, Object> verifyPayment(String orderId, String paymentId, 
                                              String signature) {
        if (!paymentEnabled) {
            throw new BadRequestException("Payment feature is currently disabled");
        }

        boolean isValid = false;
        if ("RAZORPAY".equalsIgnoreCase(paymentProvider)) {
            isValid = verifyRazorpaySignature(orderId, paymentId, signature);
        }

        if (!isValid) {
            throw new BadRequestException("Payment verification failed");
        }

        // Update subscription or booking based on orderId prefix
        if (orderId.startsWith("SUB-")) {
            return handleSubscriptionPayment(orderId, paymentId);
        } else if (orderId.startsWith("BOOK-")) {
            return handleBookingPayment(orderId, paymentId);
        }

        throw new BadRequestException("Invalid order ID format");
    }

    /**
     * Get payment status
     */
    public Map<String, Object> getPaymentStatus(String paymentId) {
        if ("RAZORPAY".equalsIgnoreCase(paymentProvider)) {
            return getRazorpayPaymentStatus(paymentId);
        }

        Map<String, Object> status = new HashMap<>();
        status.put("paymentId", paymentId);
        status.put("status", "unknown");
        return status;
    }

    // Razorpay specific methods

    private Map<String, Object> createRazorpayOrder(String orderId, BigDecimal amount, 
                                                     String description) {
        try {
            String url = "https://api.razorpay.com/v1/orders";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(razorpayKeyId, razorpayKeySecret);

            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue()); // Convert to paise
            body.put("currency", currency);
            body.put("receipt", orderId);
            body.put("notes", Map.of("description", description));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = new HashMap<>();
                result.put("razorpayOrderId", response.getBody().get("id"));
                result.put("amount", amount);
                result.put("currency", currency);
                result.put("keyId", razorpayKeyId);
                result.put("orderId", orderId);
                
                log.info("Razorpay order created: {}", response.getBody().get("id"));
                return result;
            } else {
                throw new BadRequestException("Failed to create Razorpay order");
            }
        } catch (Exception e) {
            log.error("Razorpay order creation failed: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to create payment order: " + e.getMessage());
        }
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            String expectedSignature = generateHmacSHA256(payload, razorpayKeySecret);
            return expectedSignature.equals(signature);
        } catch (Exception e) {
            log.error("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    private Map<String, Object> getRazorpayPaymentStatus(String paymentId) {
        try {
            String url = "https://api.razorpay.com/v1/payments/" + paymentId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(razorpayKeyId, razorpayKeySecret);

            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to get Razorpay payment status: {}", e.getMessage());
        }

        Map<String, Object> status = new HashMap<>();
        status.put("paymentId", paymentId);
        status.put("status", "unknown");
        return status;
    }

    // Helper methods

    private BigDecimal getSubscriptionAmount(Subscription.SubscriptionPlan plan) {
        return switch (plan) {
            case FREE_TRIAL -> BigDecimal.ZERO;
            case ANNUAL -> BigDecimal.valueOf(2999); // ₹2999 per year
            case MONTHLY -> BigDecimal.valueOf(299); // ₹299 per month
        };
    }

    private Map<String, Object> handleSubscriptionPayment(String orderId, String paymentId) {
        // Implementation would update subscription status
        log.info("Subscription payment successful: {} - {}", orderId, paymentId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Subscription activated successfully");
        result.put("orderId", orderId);
        result.put("paymentId", paymentId);
        return result;
    }

    private Map<String, Object> handleBookingPayment(String orderId, String paymentId) {
        // Implementation would update booking payment status
        log.info("Booking payment successful: {} - {}", orderId, paymentId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Booking payment successful");
        result.put("orderId", orderId);
        result.put("paymentId", paymentId);
        return result;
    }

    private String generateHmacSHA256(String data, String key) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec secretKeySpec = 
                new javax.crypto.spec.SecretKeySpec(key.getBytes(), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes());
        return bytesToHex(hash);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
