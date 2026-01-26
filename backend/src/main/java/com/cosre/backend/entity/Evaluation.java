package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sử dụng BigDecimal cho độ chính xác cao (VD: 8.50)
    // precision=4 (tổng số chữ số), scale=2 (số chữ số sau dấu phẩy) -> Max là 99.99
    @Column(precision = 4, scale = 2)
    private BigDecimal score;

    @Column(columnDefinition = "TEXT")
    private String comment; // Nhận xét chi tiết

    // Người thực hiện việc chấm (Có thể là Giảng viên hoặc Sinh viên khác)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grader_id")
    private User grader;

    // Đối tượng sinh viên được chấm (Nếu null => Chấm chung cho cả nhóm)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    // Nhóm được chấm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @JsonIgnore
    private Team team;

    // Cột mốc đánh giá (Milestone)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;

    // Loại đánh giá (Dùng Enum để phân loại nguồn điểm)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EvaluationType type;

    // Liên kết với bài tập (để biết điểm này của bài nào)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    // Thời gian chấm điểm
    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;
}