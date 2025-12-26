package com.anonymous.social.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_edit_history")
public class MessageEditHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    private GroupChatMessage message;

    @Column(columnDefinition = "TEXT")
    private String oldContent;

    private LocalDateTime editedAt;

    public MessageEditHistory() {}

    public MessageEditHistory(GroupChatMessage message, String oldContent) {
        this.message = message;
        this.oldContent = oldContent;
        this.editedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public GroupChatMessage getMessage() { return message; }
    public void setMessage(GroupChatMessage message) { this.message = message; }

    public String getOldContent() { return oldContent; }
    public void setOldContent(String oldContent) { this.oldContent = oldContent; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
}
