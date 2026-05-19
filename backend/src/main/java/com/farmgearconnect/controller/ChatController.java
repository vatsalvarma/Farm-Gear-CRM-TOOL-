package com.farmgearconnect.controller;

import com.farmgearconnect.dto.response.MessageResponse;
import com.farmgearconnect.dto.response.PageResponse;
import com.farmgearconnect.security.UserPrincipal;
import com.farmgearconnect.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Real-time messaging (REST + WebSocket)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send/{receiverId}")
    @Operation(summary = "Send text message")
    public ResponseEntity<MessageResponse> sendText(
            @PathVariable UUID receiverId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID bookingId = body.containsKey("bookingId")
                ? UUID.fromString(body.get("bookingId")) : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.sendTextMessage(
                        principal.getId(), receiverId, body.get("content"), bookingId));
    }

    @PostMapping(value = "/voice/{receiverId}",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Send voice note")
    public ResponseEntity<MessageResponse> sendVoice(
            @PathVariable UUID receiverId,
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(required = false) UUID bookingId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.sendVoiceNote(
                        principal.getId(), receiverId, audioFile, bookingId));
    }

    @GetMapping("/conversation/{userId}")
    @Operation(summary = "Get paginated conversation history")
    public ResponseEntity<PageResponse<MessageResponse>> getConversation(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                chatService.getConversation(principal.getId(), userId, page, size));
    }

    @GetMapping("/conversations")
    @Operation(summary = "Get all conversation list with last messages")
    public ResponseEntity<List<ChatService.ConversationSummary>> getConversations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                chatService.getConversationList(principal.getId()));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread message count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("unread",
                chatService.getUnreadCount(principal.getId())));
    }
}
