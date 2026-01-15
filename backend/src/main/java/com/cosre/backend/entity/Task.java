package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "tasks")
@Getter
@Setter
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
    @JsonIgnoreProperties({"tasks", "members", "milestones", "classRoom"})
    private Team team; // Task được giao cho nhóm nào

    @ManyToOne
    @JoinColumn(name = "assigned_to_id")
    @JsonIgnoreProperties({"tasks", "teams"})
    private User assignedTo; // Người được giao cụ thể trong nhóm (optional)

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.TO_DO; // Mặc định là TO_DO

    private LocalDateTime dueDate;
}
