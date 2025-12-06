package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "classes") // Tên bảng là classes (tránh trùng từ khóa class của Java)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // VD: SE1701

    private String semester; // VD: Spring 2025

    // Lớp này học môn gì
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    // Giảng viên nào dạy
    @ManyToOne
    @JoinColumn(name = "lecturer_id")
    private User lecturer;
}