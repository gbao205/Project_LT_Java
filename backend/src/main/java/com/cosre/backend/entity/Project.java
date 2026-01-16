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
    private String name; // Tên đề tài (Frontend: title)

    @Column(columnDefinition = "TEXT")
    private String description; // Mô tả

    private String technology; // Công nghệ (VD: Java, React)

    @Builder.Default
    private Integer maxStudents = 0; // Số sinh viên tối đa

    @Column(name = "submitted_date")
    private LocalDate submittedDate; // Ngày gửi đề tài

    // Trạng thái: PENDING, APPROVED, REJECTED
    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    // Lý do từ chối (Nếu có)
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    // Người tạo đề tài (Giảng viên)
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "project")
    @JsonIgnore
    private List<Team> teams;
}