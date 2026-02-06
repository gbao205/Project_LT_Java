package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "projects")
@Getter
@Setter
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

    // --- CÁC TRƯỜNG BỔ SUNG ---
    private String technology; // Công nghệ

    @Builder.Default
    private Integer maxStudents = 0; // Số SV tối đa

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner; // GVHD

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @OneToMany(mappedBy = "project")
    @JsonIgnore
    private List<Team> teams;

    // --- NGƯỜI PHẢN BIỆN ---
    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    // --- [FIX LỖI] THÊM CÁC CỘT ĐIỂM SỐ ---
    @Column(name = "review_score")
    private Double reviewScore;     // Điểm GVPB

    @Column(name = "instructor_score")
    private Double instructorScore; // Điểm GVHD

    @Column(name = "council_score")
    private Double councilScore;    // Điểm Hội đồng

    @Column(name = "review_comment", columnDefinition = "TEXT")
    private String reviewComment;
}