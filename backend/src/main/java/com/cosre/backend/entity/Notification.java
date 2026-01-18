package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "recipient") // Ngăn vòng lặp khi log dữ liệu
@EqualsAndHashCode(exclude = "recipient") // Ngăn vòng lặp khi so sánh đối tượng
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "roles", "hibernateLazyInitializer", "handler"})
    private User recipient; // Người nhận thông báo

    private String title;   // Tiêu đề (VD: "Deadline mới")
    private String message; // Nội dung chi tiết (VD: "Bạn có bài tập sắp hết hạn")
    
    @Enumerated(EnumType.STRING)    
    private NotificationType type;   // Loại: TASK, MILESTONE, SYSTEM...

    private String redirectUrl; // Đường dẫn để frontend điều hướng (VD: "/student/workspace/1")
    
    @Builder.Default
    private boolean isRead = false;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}