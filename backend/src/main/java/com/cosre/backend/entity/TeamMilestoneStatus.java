package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "team_milestone_status")
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class TeamMilestoneStatus {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id")
    @JsonIgnore
    private Team team;

    @ManyToOne
    @JoinColumn(name = "milestone_id")
    @JsonIgnore
    private Milestone milestone;

    @ElementCollection
    @CollectionTable(name = "team_milestone_completed_tasks", joinColumns = @JoinColumn(name = "status_id"))
    @Column(name = "task_id")
    private List<Long> completedTaskIds;

    @Builder.Default
    private boolean completed = false;

    @Column(columnDefinition = "TEXT")
    private String answer; // Câu trả lời của nhóm cho cột mốc

    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String feedback; // Giảng viên sẽ cập nhật trường này

}