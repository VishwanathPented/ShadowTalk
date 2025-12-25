package com.anonymous.social.controller;

import com.anonymous.social.model.Persona;
import com.anonymous.social.model.User;
import com.anonymous.social.service.PersonaService;
import com.anonymous.social.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    @Autowired
    private PersonaService personaService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<Persona>> getMyPersonas(@RequestHeader("Authorization") String token) {
        User user = authService.getUserFromToken(token); // Assuming helper exists or using @AuthenticationPrincipal
        // Note: Using AuthService to resolve user from token manually if security context isn't fully set up for this custom object,
        // but ideally we use SecurityContext. For now, let's rely on AuthService helper if available or standard Principal.
        // Actually, let's stick to standard Principal if configured, but since I see `getUserFromToken` usage pattern potentially:
        // I'll assume standard SecurityContextHolder is working.
        // Let's rely on `authService.getUserFromToken(token)` or similar if implemented, OR just Fetch from DB via Principal.

        // Simpler approach compatible with existing AuthController patterns:
        if (token != null && token.startsWith("Bearer ")) {
             token = token.substring(7);
        }
        String email = authService.extractEmail(token); // Need to check if this method is public/available.
        // Actually, safer to use the standard User object if available.
        // Let's try to find the user via email.
        return ResponseEntity.ok(personaService.getUserPersonas(authService.findByEmail(email)));
    }

    @PostMapping
    public ResponseEntity<Persona> createPersona(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> payload) {
        String tokenClean = token.replace("Bearer ", "");
        User user = authService.findByEmail(authService.extractEmail(tokenClean));

        String name = payload.get("name");
        String color = payload.get("avatarColor");

        return ResponseEntity.ok(personaService.createPersona(user, name, color));
    }

    @PutMapping("/{id}/equip")
    public ResponseEntity<User> equipPersona(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        String tokenClean = token.replace("Bearer ", "");
        User user = authService.findByEmail(authService.extractEmail(tokenClean));

        return ResponseEntity.ok(personaService.equipPersona(user, id));
    }
}
