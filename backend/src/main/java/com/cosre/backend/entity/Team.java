package com.cosre.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teamName;
    private String joinCode;

    @Column(name = "team_score")
    private BigDecimal teamScore;

    // Nhóm này thuộc lớp nào
    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    @JsonIgnoreProperties({"students", "subject"})
    private ClassRoom classRoom;

    // Nhóm làm đề tài nào
    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties("teams")
    private Project project;

    // Danh sách thành viên
    @OneToMany(mappedBy = "team")
    @JsonIgnoreProperties("team")
    private List<TeamMember> members;

}