package com.cosre.backend.dto.staff;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class StudentDetailDTO {
    private String fullName;
    private String email;
    private String studentId;

    private String eduLevel;
    private String batch;           // Khóa
    private String faculty;         // Khoa
    private String specialization;  // Chuyên ngành
    private String trainingType;    // Loại hình đào tạo
    private String studentStatus;   // Trạng thái
    private LocalDate dob;
    private LocalDate admissionDate;
}