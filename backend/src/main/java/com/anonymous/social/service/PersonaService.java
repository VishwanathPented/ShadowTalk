package com.anonymous.social.service;

import com.anonymous.social.model.Persona;
import com.anonymous.social.model.User;
import com.anonymous.social.repository.PersonaRepository;
import com.anonymous.social.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class PersonaService {

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService; // To reuse name generation logic if needed

    public List<Persona> getUserPersonas(User user) {
        return personaRepository.findByUser(user);
    }

    @Transactional
    public Persona createPersona(User user, String customName, String avatarColor) {
        String name = customName;
        if (name == null || name.trim().isEmpty()) {
            name = authService.generateRandomName(); // Using AuthService's logic
        }

        if (avatarColor == null) {
            avatarColor = generateRandomColor();
        }

        Persona persona = new Persona(name, avatarColor, user);
        return personaRepository.save(persona);
    }

    @Transactional
    public User equipPersona(User user, Long personaId) {
        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new RuntimeException("Persona not found"));

        if (!persona.getUser().getId().equals(user.getId())) {
             throw new RuntimeException("You do not own this mask.");
        }

        user.setActivePersona(persona);
        return userRepository.save(user);
    }

    // Helper to generate a random hex color
    private String generateRandomColor() {
        Random random = new Random();
        int nextInt = random.nextInt(0xffffff + 1);
        return String.format("#%06x", nextInt);
    }
}
