package com.anonymous.social.config;

import com.anonymous.social.model.User;
import com.anonymous.social.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create Default Admin if not exists
        if (userRepository.findByEmail("admin@shadow.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@shadow.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setAnonymousName("ShadowMaster");
            admin.setRole("ADMIN");
            admin.setAvatarColor("#ff0000");
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);
            System.out.println("⚠️ DEFAULT ADMIN USER CREATED: admin@shadow.com / admin123");
        }
    }
}
