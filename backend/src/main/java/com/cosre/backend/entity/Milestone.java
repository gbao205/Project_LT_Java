package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "milestones")
@Getter
@Setter
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
    @JsonIgnore
    private ClassRoom classRoom;
}