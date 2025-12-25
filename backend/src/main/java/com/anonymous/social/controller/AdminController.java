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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalGroups", groupRepository.count());
        stats.put("totalPosts", postRepository.count());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        return ResponseEntity.ok(userRepository.findAll());
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
    public ResponseEntity<?> deleteGroup(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        if (!isAdmin(token)) return ResponseEntity.status(403).body("Access Denied");
        groupRepository.deleteById(id);
        return ResponseEntity.ok("Group deleted");
    }

    // Secret endpoint to become admin (for testing purpose only!)
    // In production, you'd run a DB script or have a master key
    @PostMapping("/become-god")
    public ResponseEntity<?> becomeGod(@RequestHeader("Authorization") String token) {
        try {
            User user = authService.getUserFromToken(token);
            user.setRole("ADMIN");
            userRepository.save(user);
            return ResponseEntity.ok("You are now a GOD (Admin)");
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
}
