package com.minecraft.chat.dto;

public class ChatMessage {
    private String sender;
    private String content;
    private String messageType;
    private String timestamp;
    
    public ChatMessage() {}
    
    public ChatMessage(String sender, String content, String messageType) {
        this.sender = sender;
        this.content = content;
        this.messageType = messageType;
    }
    
    // Getters and Setters
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
    
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}