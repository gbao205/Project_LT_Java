package com.cosre.backend.dto.lecturer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal; // ✅ Import

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LecturerStudentDTO {
    private Long id;
    private String fullName;
    private String code;

    private BigDecimal score;
}