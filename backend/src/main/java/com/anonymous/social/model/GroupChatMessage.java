package com.anonymous.social.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_chat_messages")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GroupChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "messages"})
    private SocialGroup group;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "reply_to_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"replyTo", "group"}) // Prevent deep recursion
    private GroupChatMessage replyTo;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("message")
    private java.util.List<MessageReaction> reactions = new java.util.ArrayList<>();

    public GroupChatMessage() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SocialGroup getGroup() { return group; }
    public void setGroup(SocialGroup group) { this.group = group; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public java.util.List<MessageReaction> getReactions() { return reactions; }
    public void setReactions(java.util.List<MessageReaction> reactions) { this.reactions = reactions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public GroupChatMessage getReplyTo() { return replyTo; }
    public void setReplyTo(GroupChatMessage replyTo) { this.replyTo = replyTo; }
}
