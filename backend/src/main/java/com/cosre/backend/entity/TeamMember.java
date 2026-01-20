package com.cosre.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "team_members")
@Getter
@Setter
@ToString(exclude = {"team", "student"})
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
    @JsonIgnoreProperties("members")
    private Team team;

    // Là sinh viên nào
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // Vai trò: LEADER, MEMBER
    @Enumerated(EnumType.STRING)
    private TeamRole role;

    // Điểm tổng kết cuối cùng sau khi giảng viên chốt
    @Column(name = "final_grade", precision = 4, scale = 2)
    private BigDecimal finalGrade;
}
