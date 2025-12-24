package com.cosre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
//import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
//    @JsonFormat(pattern = "dd/MM/yyyy")
//    private LocalDate dob;           // Sẽ hiển thị: 20/12/2025
//
//    @JsonFormat(pattern = "dd/MM/yyyy")
//    private LocalDate admissionDate;
//
//    @JsonFormat(pattern = "dd/MM/yyyy")
//    private LocalDate unionDate;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user; // Liên kết với tài khoản User (chứa email đăng nhập, fullName)

    // --- THÔNG TIN HỌC VẤN ---
    private String studentId;        // Mã số sinh viên
    private String eduLevel;         // Bậc đào tạo
    private String batch;            // Khóa học (Khóa)
    private LocalDate dob;           // Ngày sinh
    private String trainingType;     // Loại hình đào tạo
    private LocalDate admissionDate; // Ngày nhập học
    private String studentStatus;    // Trạng thái sinh viên (Đang học, Nghỉ học...)
    private String faculty;          // Khoa
    private String major;            // Ngành
    private String specialization;   // Chuyên ngành

    // --- THÔNG TIN CÁ NHÂN (Nhúng từ class StudentProfile) ---
    @Embedded
    private StudentProfile profile;
}