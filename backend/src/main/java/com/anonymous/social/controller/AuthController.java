package com.anonymous.social.controller;

import com.anonymous.social.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String alias = request.get("alias");

        if (email == null || !email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email format"));
        }

        try {
            authService.register(email, password, alias);
            return ResponseEntity.ok(Map.of(
                "message", "OTP Sent to email",
                "email", email
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        try {
            return ResponseEntity.ok(authService.verifyOtp(email, otp));
        } catch (RuntimeException e) {
             return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        try {
            Map<String, Object> response = authService.login(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body("Login failed: " + e.getMessage());
        }
    }



    @PostMapping("/regenerate-identity")
    public ResponseEntity<?> regenerateIdentity(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            String email = authService.extractEmail(token);
            return ResponseEntity.ok(authService.regenerateIdentity(email));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to regenerate identity: " + e.getMessage()));
        }
    }
}
