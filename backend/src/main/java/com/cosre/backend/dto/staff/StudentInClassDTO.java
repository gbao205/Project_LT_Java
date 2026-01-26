package com.cosre.backend.dto.staff;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentInClassDTO {
    private String fullName;
    private String email;
    private String studentId;
}
