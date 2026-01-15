package com.cosre.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "classes") // Tên bảng là classes (tránh trùng từ khóa class của Java)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // VD: SE1701

    private String semester;

    @Column(unique = true)
    private String classCode;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    // Lớp này học môn gì
    @ManyToOne
    @JoinColumn(name = "subject_id")
    @JsonIgnore 
    private Subject subject;

    // Giảng viên nào dạy
    @ManyToOne
    @JoinColumn(name = "lecturer_id")
    private User lecturer;

    @Builder.Default
    private Integer maxCapacity = 60; // Mặc định 60 sinh viên

    // Danh sách sinh viên đã đăng ký
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "class_enrollments",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @JsonIgnore // Ngăn chặn loop JSON và load dữ liệu nặng không cần thiết
    @Builder.Default
    private Set<User> students = new HashSet<>();
    @Builder.Default
    private boolean isRegistrationOpen = false;

    public boolean canRegister() {
        return isRegistrationOpen && (students.size() < maxCapacity);
    }
}