package com.anonymous.social.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @Column(name = "anonymous_name", unique = true, nullable = false)
    private String anonymousName;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Persona> personas = new java.util.ArrayList<>();

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "active_persona_id")
    private Persona activePersona;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public User() {}

    public User(Long id, String email, String password, String anonymousName, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.anonymousName = anonymousName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAnonymousName() { return anonymousName; }
    public void setAnonymousName(String anonymousName) { this.anonymousName = anonymousName; }

    public java.util.List<Persona> getPersonas() { return personas; }
    public void setPersonas(java.util.List<Persona> personas) { this.personas = personas; }

    public Persona getActivePersona() { return activePersona; }
    public void setActivePersona(Persona activePersona) { this.activePersona = activePersona; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
