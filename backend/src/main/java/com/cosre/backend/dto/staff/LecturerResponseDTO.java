package com.cosre.backend.dto.staff;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LecturerResponseDTO {
    private Long id;
    private String CCCD;
    private String fullName;
    private String email;
    private String department;
    private String degree;
}
