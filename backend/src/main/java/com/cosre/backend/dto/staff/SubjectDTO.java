package com.cosre.backend.dto.staff;

import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class SubjectDTO {
    private Long id;
    private String subjectCode;
    private String name;
    private String specialization;
}
