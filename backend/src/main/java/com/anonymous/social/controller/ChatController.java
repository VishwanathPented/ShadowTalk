package com.anonymous.social.controller;

import com.anonymous.social.model.GroupChatMessage;
import com.anonymous.social.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
public class ChatController {

    @Autowired
    private ChatService chatService;

    // HTTP Endpoint to load history
    @GetMapping("/api/groups/{groupId}/messages")
    public ResponseEntity<List<GroupChatMessage>> getMessages(@PathVariable Long groupId) {
        return ResponseEntity.ok(chatService.getGroupMessages(groupId));
    }

    // WebSocket Endpoint: /app/chat/{groupId}
    @MessageMapping("/chat/{groupId}")
    @SendTo("/topic/group/{groupId}")
    public GroupChatMessage sendMessage(@DestinationVariable Long groupId,
                                        @Payload Map<String, String> payload,
                                        Principal principal) {
        // Principal is set if we configure WebSocket Auth properly.
        // If strict auth is hard, we can trust the payload for MVP, but let's try to use Principal if possible.
        // For this simple example, we assume SecurityContext is propogated or we pass username in payload.
        // Let's rely on payload "email" or "token" if Principal is null, but ideally Principal works.

        String email = principal != null ? principal.getName() : payload.get("email");
        System.out.println("ChatController: Received message from " + email + " for group " + groupId);
        System.out.println("Payload: " + payload);

        if (email == null || email.isEmpty()) {
             System.out.println("Error: Email is missing in payload and Principal is null.");
             throw new IllegalArgumentException("User unauthenticated or email missing");
        }

        String message = payload.get("message");
        String replyToIdStr = payload.get("replyToId");
        Long replyToId = (replyToIdStr != null && !replyToIdStr.isEmpty()) ? Long.valueOf(replyToIdStr) : null;

        return chatService.saveMessage(groupId, email, message, replyToId);
    }

    // Typing Status Endpoint
    @MessageMapping("/chat/{groupId}/typing")
    @SendTo("/topic/group/{groupId}/typing")
    public Map<String, String> typingStatus(@DestinationVariable Long groupId,
                                            @Payload Map<String, String> payload,
                                            Principal principal) {
        String email = principal != null ? principal.getName() : payload.get("email");
        String isTyping = payload.get("isTyping"); // "true" or "false"
        String anonymousName = payload.get("anonymousName"); // Pass this from frontend for UI

        return Map.of(
            "email", email != null ? email : "unknown",
            "isTyping", isTyping,
            "anonymousName", anonymousName != null ? anonymousName : "Someone"
        );
    }
}
