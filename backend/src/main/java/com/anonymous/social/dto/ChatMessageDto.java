package com.anonymous.social.dto;

import java.time.LocalDateTime;

public class ChatMessageDto {
    private String senderId;
    private String content;
    private LocalDateTime timestamp;
    private MessageType type;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        TYPING
    }

    public ChatMessageDto() {}

    public ChatMessageDto(String senderId, String content, MessageType type) {
        this.senderId = senderId;
        this.content = content;
        this.type = type;
        this.timestamp = LocalDateTime.now();
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }
}
