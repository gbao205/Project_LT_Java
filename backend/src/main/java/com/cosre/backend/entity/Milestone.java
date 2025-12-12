package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "milestones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Milestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // VD: Giai đoạn 1 - Phân tích yêu cầu

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime startDate;
    private LocalDateTime dueDate; // Hạn nộp

    // Milestone này thuộc về Lớp nào (Cả lớp nộp chung 1 hạn)
    @ManyToOne
    @JoinColumn(name = "class_id")
    private ClassRoom classRoom;
}