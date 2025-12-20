package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "team_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thành viên của nhóm nào
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    // Là sinh viên nào
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // Vai trò: LEADER, MEMBER
    @Enumerated(EnumType.STRING)
    private TeamRole role;

    // Điểm tổng kết cuối cùng sau khi giảng viên chốt
    @Column(precision = 4, scale = 2)
    private BigDecimal finalGrade;
}
