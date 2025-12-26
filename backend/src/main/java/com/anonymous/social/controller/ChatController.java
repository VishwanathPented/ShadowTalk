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
    public ResponseEntity<List<GroupChatMessage>> getMessages(@PathVariable Long groupId, Principal principal) {
        // Since we are "Anonymous", principal might be the token/email.
        // If strict security, use Principal.
        String email = principal != null ? principal.getName() : "anonymous"; // Fallback? Or require auth
        // In this implementation, we mostly use JWT filter which sets Principal
        return ResponseEntity.ok(chatService.getGroupMessagesForUser(groupId, email));
    }

    // WebSocket Endpoint: /app/chat/{groupId}
    @MessageMapping("/chat/{groupId}")
    @SendTo("/topic/group/{groupId}")
    public GroupChatMessage sendMessage(@DestinationVariable Long groupId,
                                        @Payload Map<String, Object> payload, // Changed to Object to support Lists/Ints
                                        Principal principal) {
        String email = principal != null ? principal.getName() : (String) payload.get("email");
        if (email == null) throw new IllegalArgumentException("User unauthenticated");

        String message = (String) payload.get("message");
        String replyToIdStr = (String) payload.get("replyToId");
        Long replyToId = (replyToIdStr != null && !replyToIdStr.isEmpty()) ? Long.valueOf(replyToIdStr) : null;

        String type = (String) payload.get("type"); // TEXT, POLL, etc.

        Integer expiresInMinutes = null;
        if (payload.containsKey("expiresIn")) {
             expiresInMinutes = Integer.parseInt(payload.get("expiresIn").toString());
        }

        String pollQuestion = (String) payload.get("pollQuestion");
        List<String> pollOptions = (List<String>) payload.get("pollOptions");

        return chatService.saveMessage(groupId, email, message, replyToId, type, expiresInMinutes, pollQuestion, pollOptions);
    }

    @MessageMapping("/chat/{groupId}/edit")
    @SendTo("/topic/group/{groupId}/update") // Clients listen here for edits/votes
    public GroupChatMessage editMessage(@DestinationVariable Long groupId,
                                        @Payload Map<String, String> payload,
                                        Principal principal) {
        String email = principal != null ? principal.getName() : payload.get("email");
        Long messageId = Long.valueOf(payload.get("messageId"));
        String newContent = payload.get("newContent");

        return chatService.editMessage(messageId, email, newContent);
    }

    @MessageMapping("/chat/{groupId}/vote")
    @SendTo("/topic/group/{groupId}/update")
    public GroupChatMessage votePoll(@DestinationVariable Long groupId,
                                     @Payload Map<String, Object> payload,
                                     Principal principal) {
        String email = principal != null ? principal.getName() : (String) payload.get("email");
        Long messageId = Long.valueOf(payload.get("messageId").toString());
        int optionIndex = Integer.parseInt(payload.get("optionIndex").toString());

        return chatService.votePoll(messageId, email, optionIndex);
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

    @MessageMapping("/chat/{groupId}/react")
    @SendTo("/topic/group/{groupId}/react")
    public GroupChatMessage reactToMessage(@DestinationVariable Long groupId,
                                           @Payload Map<String, String> payload,
                                           Principal principal) {
        String email = principal != null ? principal.getName() : payload.get("email");
        if (email == null) throw new IllegalArgumentException("Authentication required for reactions");

        Long messageId = Long.valueOf(payload.get("messageId"));
        String emoji = payload.get("emoji");

        return chatService.addReaction(messageId, email, emoji);
    }
}
