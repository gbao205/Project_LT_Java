package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Trạng thái duyệt đề tài: PENDING, APPROVED, REJECTED
    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    // Mối quan hệ: Một đề tài có thể được chọn bởi nhiều nhóm
    @OneToMany(mappedBy = "project")
    private List<Team> teams;
}