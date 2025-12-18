package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String reporterEmail; // Email người báo cáo
    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean isResolved = false; // Trạng thái: false = Chờ xử lý, true = Đã xong
}