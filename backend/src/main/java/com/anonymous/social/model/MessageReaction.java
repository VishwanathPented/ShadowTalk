package com.anonymous.social.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "message_reactions")
public class MessageReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    @JsonIgnoreProperties("reactions") // Prevent infinite recursion
    private GroupChatMessage message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "groups", "hibernateLazyInitializer"})
    private User user;

    @Column(nullable = false)
    private String emoji;

    public MessageReaction() {}

    public MessageReaction(GroupChatMessage message, User user, String emoji) {
        this.message = message;
        this.user = user;
        this.emoji = emoji;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public GroupChatMessage getMessage() { return message; }
    public void setMessage(GroupChatMessage message) { this.message = message; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
}
