package com.minecraft.chat.controller;

import com.minecraft.chat.model.Message;
import com.minecraft.chat.dto.ChatMessage;
import com.minecraft.chat.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;
    
    private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    // دریافت تاریخچه پیام‌ها
    @GetMapping("/api/messages")
    public List<ChatMessage> getMessageHistory() {
        return messageRepository.findTop50ByOrderByTimestampDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // مدیریت پیام‌های چت
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        // ذخیره پیام در دیتابیس
        Message message = new Message(chatMessage.getSender(), 
                                    chatMessage.getContent(), 
                                    "CHAT");
        messageRepository.save(message);
        
        // تبدیل به DTO و بازگشت
        return convertToDto(message);
    }

    // مدیریت ورود کاربران
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, 
                              SimpMessageHeaderAccessor headerAccessor) {
        // اضافه کردن کاربر در session
        if (headerAccessor.getSessionAttributes() != null) {
            headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        }
        
        // ذخیره پیام ورود
        Message message = new Message(chatMessage.getSender(), 
                                    chatMessage.getSender() + " به چت پیوست", 
                                    "JOIN");
        messageRepository.save(message);
        
        return convertToDto(message);
    }

    // تبدیل Entity به DTO
    private ChatMessage convertToDto(Message message) {
        ChatMessage dto = new ChatMessage();
        dto.setSender(message.getSender());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType());
        dto.setTimestamp(message.getTimestamp().format(formatter));
        return dto;
    }
}