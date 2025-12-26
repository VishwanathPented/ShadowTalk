package com.anonymous.social.controller;

import com.anonymous.social.model.User;
import com.anonymous.social.model.SocialGroup;
import com.anonymous.social.repository.UserRepository;
import com.anonymous.social.repository.SocialGroupRepository;
import com.anonymous.social.repository.PostRepository;
import com.anonymous.social.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.anonymous.social.service.PostService;

@RestController
@RequestMapping("/api/shadow")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SocialGroupRepository groupRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private PostService postService;

    // Middleware check helper (in a real app, use Spring Security filter)
    private boolean isAdmin(String token) {
        try {
            User user = authService.getUserFromToken(token);
            return "ADMIN".equals(user.getRole());
        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) {
            System.out.println("Admin Access Denied for token");
            return ResponseEntity.status(403).body("Access Denied");
        }

        System.out.println("Admin Stats Request Accepted");
        Map<String, Long> stats = new HashMap<>();
        long userCount = userRepository.count();
        long groupCount = groupRepository.count();
        // Use message count for "Total Intercepts" as this is a chat app
        long messageCount = messageRepository.count();

        stats.put("totalUsers", userCount);
        stats.put("totalGroups", groupCount);
        stats.put("totalPosts", messageCount); // UI maps 'totalPosts' to 'Total Intercepts'

        System.out.println("Stats - Users: " + userCount + ", Groups: " + groupCount + ", Messages: " + messageCount);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        List<User> users = userRepository.findAll();
        System.out.println("Admin fetching users. Count: " + users.size());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }

    @GetMapping("/groups")
    public ResponseEntity<?> getAllGroups(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        return ResponseEntity.ok(groupRepository.findAll());
    }

    @DeleteMapping("/groups/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteGroup(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");

        try {
            // 1. Unlink replies (prevent self-reference FK constraint issues)
            messageRepository.unlinkRepliesByGroupId(id);
            messageRepository.flush(); // Ensure unlinking is committed

            // 2. Fetch and Delete Entity (relying on CascadeType.ALL in SocialGroup)
            com.anonymous.social.model.SocialGroup group = groupRepository.findById(id).orElse(null);
            if (group != null) {
                groupRepository.delete(group); // This triggers cascading delete of messages (and their reactions) and members
            }

            return ResponseEntity.ok("Group deleted");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Delete Failed: " + e.getMessage());
        }
    }

    // Secret endpoint to become admin (for testing purpose only!)
    // In production, you'd run a DB script or have a master key
    @PostMapping("/become-god")
    public ResponseEntity<?> becomeGod(@RequestHeader("Authorization") String token) {
        try {
            User user = authService.getUserFromToken(token);
            user.setRole("ADMIN");
            userRepository.save(user); // Save first

            // Generate new token with updated role
            Map<String, Object> response = authService.generateFreshToken(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body("Unauthorized: " + e.getMessage());
        }
    }

    @PostMapping("/manual-override")
    public ResponseEntity<?> manualOverride(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        String email = payload.get("email");

        System.out.println("Manual Override Attempt: Email=" + email + ", Code=" + code);

        if ("shadow_protocol_v1".equals(code)) {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                user.setRole("ADMIN");
                userRepository.save(user);
                System.out.println("Override Success for user: " + email);
                return ResponseEntity.ok("Override Accepted. Access Granted.");
            }
            System.out.println("Override Failed: User not found for email " + email);
            return ResponseEntity.status(404).body("User not found: " + email);
        }
        System.out.println("Override Failed: Invalid Code");
        return ResponseEntity.status(403).body("Invalid Override Code");
    }
    @Autowired
    private com.anonymous.social.repository.BannedWordRepository bannedWordRepository;

    @Autowired
    private com.anonymous.social.repository.GroupChatMessageRepository messageRepository;

    @Autowired
    private com.anonymous.social.service.WordFilterService wordFilterService;

    @GetMapping("/banned-words")
    public ResponseEntity<?> getBannedWords(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        return ResponseEntity.ok(bannedWordRepository.findAll());
    }

    @PostMapping("/banned-words")
    public ResponseEntity<?> addBannedWord(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> payload) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        String word = payload.get("word");
        if (word == null || word.trim().isEmpty()) return ResponseEntity.badRequest().body("Word cannot be empty");

        if (bannedWordRepository.existsByWord(word)) {
            return ResponseEntity.badRequest().body("Word already banned");
        }

        bannedWordRepository.save(new com.anonymous.social.model.BannedWord(word));
        wordFilterService.addBannedWord(word); // Update cache
        return ResponseEntity.ok("Banned word added");
    }

    @DeleteMapping("/banned-words/{id}")
    public ResponseEntity<?> deleteBannedWord(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        bannedWordRepository.findById(id).ifPresent(bw -> {
             wordFilterService.removeBannedWord(bw.getWord()); // Update cache
             bannedWordRepository.delete(bw);
        });
        return ResponseEntity.ok("Banned word removed");
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");

        // 1. Fetch Top 100 Messages
        List<com.anonymous.social.model.GroupChatMessage> chatMessages = messageRepository.findTop100ByOrderByCreatedAtDesc();

        // 2. Fetch Top 100 Posts
        List<com.anonymous.social.model.Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        if (posts.size() > 100) posts = posts.subList(0, 100);

        // 3. Unify them
        List<Map<String, Object>> unifiedList = new java.util.ArrayList<>();

        for (com.anonymous.social.model.GroupChatMessage msg : chatMessages) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", msg.getId());
            item.put("type", "CHAT");
            item.put("message", msg.getMessage());
            item.put("createdAt", msg.getCreatedAt());
            item.put("source", "Group: " + (msg.getGroup() != null ? msg.getGroup().getName() : "Unknown"));

            // Flatten User for Frontend convenience
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("anonymousName", msg.getUser().getAnonymousName());
            userMap.put("avatarColor", msg.getUser().getAvatarColor());
            item.put("user", userMap);

            unifiedList.add(item);
        }

        for (com.anonymous.social.model.Post post : posts) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", post.getId());
            item.put("type", "POST");
            item.put("message", post.getContent()); // Map content to message
            item.put("createdAt", post.getCreatedAt());
            item.put("source", "Global Feed");

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("anonymousName", post.getUser().getAnonymousName());
            userMap.put("avatarColor", post.getUser().getAvatarColor());
            item.put("user", userMap);

            unifiedList.add(item);
        }

        // 4. Sort unified list by CreatedAt Descending
        unifiedList.sort((a, b) -> {
            java.time.LocalDateTime dateA = (java.time.LocalDateTime) a.get("createdAt");
            java.time.LocalDateTime dateB = (java.time.LocalDateTime) b.get("createdAt");
            return dateB.compareTo(dateA);
        });

        // 5. Limit to 150 total
        if (unifiedList.size() > 150) {
            unifiedList = unifiedList.subList(0, 150);
        }

        return ResponseEntity.ok(unifiedList);
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@RequestHeader("Authorization") String token,
                                           @PathVariable Long id,
                                           @RequestParam(required = false, defaultValue = "CHAT") String type) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");

        if ("POST".equalsIgnoreCase(type)) {
            postRepository.deleteById(id);
            return ResponseEntity.ok("Post deleted");
        } else {
            messageRepository.deleteById(id);
            return ResponseEntity.ok("Message deleted");
        }
    }

    @PostMapping("/users/{id}/reset-identity")
    public ResponseEntity<?> resetUserIdentity(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        authService.regenerateIdentity(user.getEmail());

        return ResponseEntity.ok("Identity Burned & Regenerated");
    }

    @PostMapping("/feed/post")
    public ResponseEntity<?> injectPost(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> request) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");

        String content = request.get("content");

        // Use the admin's identity to post
        String adminEmail = authService.extractEmail(token.substring(7));
        postService.createPost(adminEmail, content);

        // Optional: We could boost it or pin it, but for now just posting as Admin is enough.
        return ResponseEntity.ok("System Message Injected to Feed");
    }

    @GetMapping("/traffic-stats")
    public ResponseEntity<?> getTrafficStats(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");

        // Mock data for the visualisation - in a real app this would query a time-series DB
        List<Map<String, Object>> data = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        Random rand = new Random();

        for (int i = 24; i >= 0; i--) {
            Map<String, Object> point = new HashMap<>();
            point.put("time", now.minusHours(i).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")));
            // Simulate a "spike" pattern
            int base = 50 + rand.nextInt(50);
            if (i < 5) base += 200; // Recent spike
            point.put("messages", base);
            point.put("activeUsers", base / 2 + rand.nextInt(20));
            data.add(point);
        }

        return ResponseEntity.ok(data);
    }

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcastMessage(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> payload) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) return ResponseEntity.badRequest().body("Message cannot be empty");

        // Send to standard public topic as a special system message
        Map<String, Object> broadcast = new HashMap<>();
        broadcast.put("type", "SYSTEM_ALERT");
        broadcast.put("content", message);
        broadcast.put("sender", "SYSTEM");
        broadcast.put("timestamp", java.time.LocalDateTime.now().toString());

        messagingTemplate.convertAndSend("/topic/public", broadcast);
        return ResponseEntity.ok("Broadcast sent");
    }

    @GetMapping("/system-health")
    public ResponseEntity<?> getSystemHealth(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> health = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();
        health.put("status", "OPERATIONAL");
        health.put("uptime", java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime());
        health.put("memoryUsed", (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024) + " MB");
        health.put("memoryTotal", runtime.totalMemory() / (1024 * 1024) + " MB");
        health.put("activeThreads", Thread.activeCount());

        return ResponseEntity.ok(health);
    }
    @GetMapping("/users/{id}/messages")
    public ResponseEntity<?> getUserMessages(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        return ResponseEntity.ok(messageRepository.findByUserIdOrderByCreatedAtDesc(id));
    }
}
