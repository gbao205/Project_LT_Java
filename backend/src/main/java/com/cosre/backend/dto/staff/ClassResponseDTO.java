package com.cosre.backend.dto.staff;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ClassResponseDTO {
    private Long id;
    private String name;
    private String classCode;
    private String semester;
    private String subjectName;
    private String lecturerName;
    private boolean isRegistrationOpen;
    private int studentCount;
    private int maxCapacity;
    private LocalDate startDate;
    private LocalDate endDate;
}