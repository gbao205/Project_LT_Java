package com.cosre.backend.dto;

import lombok.Data;

@Data
public class ClassRequest {
    private String name;       // Tên lớp (VD: SE1701)
    private int semester;   // Học kỳ (VD: Spring 2025)
    private Long subjectId;    // ID môn học
    private Long lecturerId;   // ID giảng viên
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private String classCode;
}