package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "ai_chat_messages")
public class AIChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    // "USER" hoặc "AI"
    private String sender;

    private LocalDateTime timestamp;

    // Liên kết với người dùng (sinh viên)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
