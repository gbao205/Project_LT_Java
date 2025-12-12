package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teamName;

    // Nhóm này thuộc lớp nào
    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private ClassRoom classRoom;

    // Nhóm làm đề tài nào
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    // Danh sách thành viên
    @OneToMany(mappedBy = "team")
    private List<TeamMember> members;
}