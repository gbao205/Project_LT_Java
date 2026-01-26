package com.cosre.backend.dto.staff;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentResponseDTO {
    private Long id;
    private String studentId;
    private String fullName;
    private String email;
    private String major;
}
