package com.anonymous.social.listener;

import com.anonymous.social.model.User;
import com.anonymous.social.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    // Map<GroupId, Set<Username>>
    private final Map<Long, Set<String>> groupActiveUsers = new ConcurrentHashMap<>();

    // Map<SessionId, Set<Long>>
    private final Map<String, Set<Long>> sessionGroups = new ConcurrentHashMap<>();

    @EventListener
    public void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();
        Principal userPrincipal = headerAccessor.getUser();
        String sessionId = headerAccessor.getSessionId();

        if (destination != null && destination.startsWith("/topic/group/") && !destination.endsWith("/active") && !destination.endsWith("/react") && !destination.endsWith("/typing") && userPrincipal != null) {
            String groupIdStr = destination.replace("/topic/group/", "");
            try {
                Long groupId = Long.parseLong(groupIdStr);
                String email = userPrincipal.getName(); // Email is username

                // Get Anonymous Name
                Optional<User> userOpt = userRepository.findByEmail(email);
                String displayName = userOpt.map(User::getAnonymousName).orElse("Ghost");

                groupActiveUsers.computeIfAbsent(groupId, k -> ConcurrentHashMap.newKeySet()).add(displayName);
                sessionGroups.computeIfAbsent(sessionId, k -> new HashSet<>()).add(groupId);

                broadcastActiveUsers(groupId);
            } catch (NumberFormatException e) {
                // Ignore non-group subscriptions
            }
        }
    }

    @EventListener
    public void handleSessionDisconnectEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Principal userPrincipal = headerAccessor.getUser();

        Set<Long> groups = sessionGroups.remove(sessionId);
        if (groups != null && userPrincipal != null) {
            String email = userPrincipal.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            String displayName = userOpt.map(User::getAnonymousName).orElse("Ghost");

            for (Long groupId : groups) {
                Set<String> users = groupActiveUsers.get(groupId);
                if (users != null) {
                    users.remove(displayName);
                    if (users.isEmpty()) {
                        groupActiveUsers.remove(groupId);
                        messagingTemplate.convertAndSend("/topic/group/" + groupId + "/active", Collections.emptySet());
                    } else {
                        broadcastActiveUsers(groupId);
                    }
                }
            }
        }
    }

    // Better approach for tracking Active Users in a Chat Room:
    // When a user subscribes, we add them.
    // BUT we need to remove them on disconnect.
    // Let's create a SessionGroupRegistry.

    private void broadcastActiveUsers(Long groupId) {
        Set<String> users = groupActiveUsers.getOrDefault(groupId, Collections.emptySet());
        messagingTemplate.convertAndSend("/topic/group/" + groupId + "/active", users);
    }
}
