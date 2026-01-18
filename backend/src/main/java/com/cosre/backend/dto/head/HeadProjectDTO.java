package com.cosre.backend.dto.head;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class HeadProjectDTO {
    private Long id;
    private String title;
    private String description;
    private String technology;
    private int maxStudents;
    private LocalDate submittedDate;
    private String status;
    private String reviewerName;
}