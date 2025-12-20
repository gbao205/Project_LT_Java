package com.cosre.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Data // Annotation này sẽ tự tạo getRecipient và setRecipient cho bạn
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    @Id
    private String id;

    private String sender;    // Email người gửi
    private String recipient; // <--- THÊM DÒNG NÀY (Email người nhận)
    private String content;   // Nội dung tin nhắn
    private String type;      // "CHAT" hoặc "JOIN"

    private LocalDateTime timestamp;
}