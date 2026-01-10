package com.cosre.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    @Id
    private String id;

    private String sender;    // Email người gửi
    private String recipient; // Email người nhận (cho chat 1-1)
    private String roomId;    // ID phòng (cho chat nhóm Team/Class)
    private String content;   // Nội dung tin nhắn
    private String type;      // "CHAT" hoặc "JOIN"

    private LocalDateTime timestamp;
    private Boolean isRead = false;
}