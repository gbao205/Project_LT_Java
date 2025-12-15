package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "milestone_id")
    private Milestone milestone; // Task thuộc Milestone nào (optional, for context)

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team; // Task được giao cho nhóm nào

    @ManyToOne
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo; // Người được giao cụ thể trong nhóm (optional)

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.TO_DO; // Mặc định là TO_DO

    private LocalDateTime dueDate;
}
