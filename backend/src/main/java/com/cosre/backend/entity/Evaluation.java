package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double score; // Điểm số (VD: 8.5)

    @Column(columnDefinition = "TEXT")
    private String comment; // Nhận xét (VD: "Làm tốt nhưng thiếu diagram")

    // Ai chấm?
    @ManyToOne
    @JoinColumn(name = "grader_id")
    private User grader;

    // Chấm ai?
    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    // Chấm nhóm nào?
    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    // Điểm này thuộc về cột điểm nào (Milestone nào)
    @ManyToOne
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;
}