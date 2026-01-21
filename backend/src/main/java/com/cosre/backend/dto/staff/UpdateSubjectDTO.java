package com.cosre.backend.dto.staff;

import lombok.Data;

@Data
public class UpdateSubjectDTO {
    private String subjectCode;
    private String name;
    private String specialization;
}