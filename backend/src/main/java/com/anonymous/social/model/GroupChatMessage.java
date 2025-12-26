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

    @Enumerated(EnumType.STRING)
    private MessageType type = MessageType.TEXT;

    private LocalDateTime expiresAt;

    private boolean isEdited = false;

    // Poll Fields
    private String pollQuestion;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "poll_options", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "option_text")
    private java.util.List<String> pollOptions = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("message")
    private java.util.List<PollVote> votes = new java.util.ArrayList<>();

    public enum MessageType {
        TEXT, POLL, IMAGE, SYSTEM
    }

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

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isEdited() { return isEdited; }
    public void setEdited(boolean edited) { isEdited = edited; }

    public String getPollQuestion() { return pollQuestion; }
    public void setPollQuestion(String pollQuestion) { this.pollQuestion = pollQuestion; }

    public java.util.List<String> getPollOptions() { return pollOptions; }
    public void setPollOptions(java.util.List<String> pollOptions) { this.pollOptions = pollOptions; }

    public java.util.List<PollVote> getVotes() { return votes; }
    public void setVotes(java.util.List<PollVote> votes) { this.votes = votes; }
}
