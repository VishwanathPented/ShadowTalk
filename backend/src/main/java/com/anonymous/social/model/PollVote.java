package com.anonymous.social.model;

import jakarta.persistence.*;

@Entity
@Table(name = "poll_votes")
public class PollVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    private GroupChatMessage message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int optionIndex;

    public PollVote() {}

    public PollVote(GroupChatMessage message, User user, int optionIndex) {
        this.message = message;
        this.user = user;
        this.optionIndex = optionIndex;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public GroupChatMessage getMessage() { return message; }
    public void setMessage(GroupChatMessage message) { this.message = message; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getOptionIndex() { return optionIndex; }
    public void setOptionIndex(int optionIndex) { this.optionIndex = optionIndex; }
}
