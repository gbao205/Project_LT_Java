package com.cosre.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    private String joinCode;

    // Nhóm này thuộc lớp nào
    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    @JsonIgnoreProperties("teams")  // Ngắt vòng lặp nếu ClassRoom có list teams
    private ClassRoom classRoom;

    // Nhóm làm đề tài nào
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    // Danh sách thành viên
    @OneToMany(mappedBy = "team")
    @JsonIgnoreProperties("team") // Bỏ qua field 'team' trong mỗi TeamMember
    private List<TeamMember> members;

}