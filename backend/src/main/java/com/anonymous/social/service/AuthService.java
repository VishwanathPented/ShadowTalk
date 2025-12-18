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

    private static final String[] ADJECTIVES = {"Silent", "Mysterious", "Hidden", "Shadow", "Ghost", "Unknown", "Secret", "Dark", "White", "Red", "Blue", "Fast", "Happy", "Sad", "Calm", "Brave"};
    private static final String[] NOUNS = {"User", "Walker", "Talker", "Rider", "Dreamer", "Thinker", "Ninja", "Warrior", "Pilot", "Captain", "Wolf", "Tiger", "Eagle", "Falcon", "Bear"};

    public User register(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setAnonymousName(generateUniqueAnonymousName());

        return userRepository.save(user);
    }

    public String login(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        var user = userRepository.findByEmail(email).orElseThrow();
        return jwtUtil.generateToken(new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), java.util.Collections.emptyList()));
    }

    private String generateUniqueAnonymousName() {
        Random random = new Random();
        String name;
        do {
            String adj = ADJECTIVES[random.nextInt(ADJECTIVES.length)];
            String noun = NOUNS[random.nextInt(NOUNS.length)];
            int number = random.nextInt(1000, 9999);
            name = adj + "-" + noun + "-" + number;
        } while (userRepository.existsByAnonymousName(name));
        return name;
    }
}
