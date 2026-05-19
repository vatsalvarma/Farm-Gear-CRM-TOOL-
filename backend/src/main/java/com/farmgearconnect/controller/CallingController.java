package com.farmgearconnect.controller;

import com.farmgearconnect.security.UserPrincipal;
import com.farmgearconnect.service.MaskedCallingService;
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
@RequestMapping("/calling")
@RequiredArgsConstructor
@Tag(name = "Calling", description = "Masked calling service")
@SecurityRequirement(name = "bearerAuth")
public class CallingController {

    private final MaskedCallingService maskedCallingService;

    @PostMapping("/initiate/{receiverId}")
    @Operation(summary = "Initiate masked call to another user")
    public ResponseEntity<Map<String, String>> initiateCall(
            @PathVariable UUID receiverId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                maskedCallingService.initiateMaskedCall(principal.getId(), receiverId));
    }

    @GetMapping("/virtual-number/{userId}")
    @Operation(summary = "Get virtual number for user")
    public ResponseEntity<Map<String, String>> getVirtualNumber(
            @PathVariable UUID userId) {
        String virtualNumber = maskedCallingService.getVirtualNumber(userId);
        return ResponseEntity.ok(Map.of("virtualNumber", virtualNumber));
    }

    @GetMapping("/status/{callId}")
    @Operation(summary = "Get call status")
    public ResponseEntity<Map<String, String>> getCallStatus(
            @PathVariable String callId) {
        return ResponseEntity.ok(maskedCallingService.getCallStatus(callId));
    }
}
