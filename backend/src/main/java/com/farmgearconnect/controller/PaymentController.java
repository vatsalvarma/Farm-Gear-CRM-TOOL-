package com.farmgearconnect.controller;

import com.farmgearconnect.entity.Subscription;
import com.farmgearconnect.security.UserPrincipal;
import com.farmgearconnect.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment gateway integration")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/subscription/create-order")
    @Operation(summary = "Create payment order for subscription")
    public ResponseEntity<Map<String, Object>> createSubscriptionOrder(
            @RequestParam Subscription.SubscriptionPlan plan,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                paymentService.createSubscriptionPaymentOrder(principal.getId(), plan));
    }

    @PostMapping("/booking/{bookingId}/create-order")
    @Operation(summary = "Create payment order for booking deposit")
    public ResponseEntity<Map<String, Object>> createBookingOrder(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                paymentService.createBookingPaymentOrder(bookingId, principal.getId()));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify payment after completion")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(
                paymentService.verifyPayment(
                        payload.get("orderId"),
                        payload.get("paymentId"),
                        payload.get("signature")));
    }

    @GetMapping("/status/{paymentId}")
    @Operation(summary = "Get payment status")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable String paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(paymentId));
    }
}
