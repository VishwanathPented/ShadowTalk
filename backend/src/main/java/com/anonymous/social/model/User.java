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

    @Column(name = "reputation_score")
    private Integer reputationScore = 0;

    @Column(name = "avatar_color")
    private String avatarColor;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String role = "USER";

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_follows",
        joinColumns = @JoinColumn(name = "follower_id"),
        inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"followers", "following", "password"})
    private java.util.Set<User> following = new java.util.HashSet<>();

    @ManyToMany(mappedBy = "following", fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"followers", "following", "password"})
    private java.util.Set<User> followers = new java.util.HashSet<>();

    public User() {}

    public User(Long id, String email, String password, String anonymousName, String avatarColor, LocalDateTime createdAt, String role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.anonymousName = anonymousName;
        this.avatarColor = avatarColor;
        this.createdAt = createdAt;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAnonymousName() { return anonymousName; }
    public void setAnonymousName(String anonymousName) { this.anonymousName = anonymousName; }

    public Integer getReputationScore() { return reputationScore != null ? reputationScore : 0; }
    public void setReputationScore(Integer reputationScore) { this.reputationScore = reputationScore; }

    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public java.util.Set<User> getFollowing() { return following; }
    public void setFollowing(java.util.Set<User> following) { this.following = following; }

    public java.util.Set<User> getFollowers() { return followers; }
    public void setFollowers(java.util.Set<User> followers) { this.followers = followers; }
}
