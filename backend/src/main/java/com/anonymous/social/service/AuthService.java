package com.anonymous.social.service;

import com.anonymous.social.model.User;
import com.anonymous.social.repository.UserRepository;
import com.anonymous.social.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthenticationManager authenticationManager;

    private static final String[] ADJECTIVES = {
            "Cyber", "Neon", "Shadow", "Ghost", "Dark", "Rogue", "Silent", "Hidden", "Phantom", "Spectral",
            "Void", "Null", "Binary", "Digital", "Electric", "Cosmic", "Lunar", "Solar", "Stellar", "Astral",
            "Glitch", "Echo", "Misty", "Frozen", "Crimson", "Azure", "Golden", "Silver", "Iron", "Steel"
    };
    private static final String[] NOUNS = {
            "Walker", "Runner", "Surfer", "Ninja", "Samurai", "Knight", "Wizard", "Mage", "Hacker", "Coder",
            "Bot", "Droid", "Wolf", "Fox", "Tiger", "Lion", "Dragon", "Phoenix", "Viper", "Cobra",
            "Raven", "Hawk", "Eagle", "Owl", "Shark", "Whale", "Bear", "Panda", "Koala", "Sloth"
    };

    public User register(String email, String password, String alias) {
        if (userRepository.findByEmail(email).isPresent()) {
            User existing = userRepository.findByEmail(email).get();
            if (existing.isVerified()) {
                throw new RuntimeException("Email already in use");
            } else {
                // Resend OTP if not verified? Or overwrite?
                // Let's overwrite for now, treating as new signup attempt
                userRepository.delete(existing);
            }
        }

        String finalName;
        if (alias != null && !alias.trim().isEmpty()) {
            if (userRepository.existsByAnonymousName(alias)) {
                throw new RuntimeException("Alias already taken");
            }
            finalName = alias;
        } else {
            finalName = generateUniqueAnonymousName();
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setAnonymousName(finalName);

        // OTP Logic
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        user.setVerified(false);

        User savedUser = userRepository.save(user);
        emailService.sendOtp(email, otp);

        return savedUser;
    }

    // Kept for backward compatibility if needed, though controller will update
    public User register(String email, String password) {
        return register(email, password, null);
    }

    @Autowired
    private com.anonymous.social.repository.PostRepository postRepository;

    public java.util.Map<String, Object> login(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        var user = userRepository.findByEmail(email).orElseThrow();

        if (!user.isVerified()) {
             throw new RuntimeException("Account not verified. Please verify your email.");
        }

        // Fix: Add authorities
        var authorities = java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole()));
        var userDetails = new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);

        // Fix: Add role to JWT claims
        String token = jwtUtil.generateToken(java.util.Map.of(
            "anonymousName", user.getAnonymousName(),
            "role", user.getRole()
        ), userDetails);

        return buildAuthResponse(user, token);
    }



    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public String extractEmail(String token) {
        return jwtUtil.extractUsername(token);
    }

    public String generateRandomName() { // Renamed to match usage in PersonaService or keep unique name
         return generateUniqueAnonymousName();
    }

    public User getUserFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = extractEmail(token);
        return findByEmail(email);
    }

    public String generateUniqueAnonymousName() {
        Random random = new Random();
        String name;
        do {
            String adj = ADJECTIVES[random.nextInt(ADJECTIVES.length)];
            String noun = NOUNS[random.nextInt(NOUNS.length)];
            int number = random.nextInt(1000, 9999);
            name = adj + noun + "#" + number;
        } while (userRepository.existsByAnonymousName(name));
        return name;
    }

    public java.util.Map<String, Object> regenerateIdentity(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        String newName = generateUniqueAnonymousName();

        user.setAnonymousName(newName);
        userRepository.save(user);

        // Fix: Add authorities and role to JWT
        var authorities = java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole()));
        var userDetails = new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);

        String newToken = jwtUtil.generateToken(java.util.Map.of(
            "anonymousName", user.getAnonymousName(),
            "role", user.getRole()
        ), userDetails);

        return buildAuthResponse(user, newToken);
    }

    public java.util.Map<String, Object> getMyProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        // For /me endpoint, we don't necessarily need to reissue a token, but returning one is fine.
        // Or we can accept null token and just not return it.
        return buildAuthResponse(user, null);
    }

    public java.util.Map<String, Object> generateFreshToken(User user) {
        // Fix: Add authorities and role to JWT
        var authorities = java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole()));
        var userDetails = new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);

        String newToken = jwtUtil.generateToken(java.util.Map.of(
                "anonymousName", user.getAnonymousName(),
                "role", user.getRole()
        ), userDetails);

        return buildAuthResponse(user, newToken);
    }

    private java.util.Map<String, Object> buildAuthResponse(User user, String token) {
        long postCount = postRepository.countByUser(user);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        if (token != null) {
            response.put("token", token);
        }
        response.put("anonymousName", user.getAnonymousName());
        response.put("reputationScore", user.getReputationScore());
        response.put("postCount", postCount);
        response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        response.put("avatarColor", user.getAvatarColor() != null ? user.getAvatarColor() : "#6366f1");
        response.put("role", user.getRole());
        return response;
    }

    public java.util.Map<String, Object> verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
             return generateFreshToken(user);
        }

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP Expired");
        }

        // OTP Valid
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        // Generate Token
        return generateFreshToken(user);
    }

}
