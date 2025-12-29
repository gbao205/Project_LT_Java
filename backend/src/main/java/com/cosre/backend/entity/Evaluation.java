package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

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
    private Team team;

    // Cột mốc đánh giá (Milestone)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;

    // Loại đánh giá (Dùng Enum để phân loại nguồn điểm)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EvaluationType type;
}