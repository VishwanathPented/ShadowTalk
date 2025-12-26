package com.anonymous.social.model;

import com.anonymous.social.model.GroupChatMessage;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "reported_post_id")
    private Post reportedPost;

    @ManyToOne
    @JoinColumn(name = "reported_message_id")
    private GroupChatMessage reportedMessage;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String type; // "POST" or "CHAT"

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Report() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }
    public Post getReportedPost() { return reportedPost; }
    public void setReportedPost(Post reportedPost) { this.reportedPost = reportedPost; }
    public GroupChatMessage getReportedMessage() { return reportedMessage; }
    public void setReportedMessage(GroupChatMessage reportedMessage) { this.reportedMessage = reportedMessage; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
