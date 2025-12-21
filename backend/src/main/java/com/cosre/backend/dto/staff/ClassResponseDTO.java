package com.cosre.backend.dto.staff;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassResponseDTO {
    private Long id;
    private String name;
    private String classCode;
    private int semester;
    private String subjectName;
    private String lecturerName;
    private boolean isRegistrationOpen;
    private int studentCount; // Số sinh viên đã đăng ký
    private int maxCapacity;  // Sĩ số tối đa (60)
}