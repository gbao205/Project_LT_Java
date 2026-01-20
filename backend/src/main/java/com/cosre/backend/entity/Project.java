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

    // --- CÁC TRƯỜNG MỚI BỔ SUNG CHO HEAD DEPARTMENT ---

    private String technology; // Công nghệ sử dụng

    @Builder.Default
    private Integer maxStudents = 0; // Số lượng sinh viên tối đa

    @Column(name = "submitted_date")
    private LocalDate submittedDate; // Ngày giảng viên gửi đề tài

    @Column(columnDefinition = "TEXT")
    private String rejectionReason; // Lý do từ chối (nếu có)

    // Quan hệ với Giảng viên (Người tạo đề tài)
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    // --------------------------------------------------

    // Trạng thái duyệt: PENDING, APPROVED, REJECTED
    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    // Mối quan hệ: Một đề tài có thể được chọn bởi nhiều nhóm
    @OneToMany(mappedBy = "project")
    @JsonIgnore
    private List<Team> teams;

    // --- [MỚI] Người phản biện (Reviewer) - Do Head chỉ định ---
    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;
    // --- BỔ SUNG CÁC TRƯỜNG LƯU KẾT QUẢ PHẢN BIỆN ---
    @Column(name = "review_score")
    private Double reviewScore; // Điểm phản biện (thang 10)

    @Column(name = "review_comment", columnDefinition = "TEXT")
    private String reviewComment; // Nhận xét của phản biện
}