package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
    @JsonIgnore // Quan trọng: Ngắt vòng lặp JSON. Jackson sẽ bỏ qua field này khi trả về response.
    //@ToString.Exclude // Ngắt vòng lặp toString của Lombok
    private List<Team> teams;
}