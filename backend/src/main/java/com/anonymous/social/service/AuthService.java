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
            throw new RuntimeException("Email already in use");
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

        return userRepository.save(user);
    }

    // Kept for backward compatibility if needed, though controller will update
    public User register(String email, String password) {
        return register(email, password, null);
    }

    public String login(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        var user = userRepository.findByEmail(email).orElseThrow();
        var userDetails = new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), java.util.Collections.emptyList());
        return jwtUtil.generateToken(java.util.Map.of("anonymousName", user.getAnonymousName()), userDetails);
    }

    private String generateUniqueAnonymousName() {
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
}
