package com.cosre.backend.dto.head;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor // Cần thiết cho Jackson/Hibernate
@AllArgsConstructor // Cần thiết cho @Builder
public class HeadProjectDTO {
    private Long id;
    private String title;       // Tương ứng với Project.name
    private String description;
    private String technology;
    private int maxStudents;
    private LocalDate submittedDate;
    private String status;

    // Thông tin phản biện
    private Long reviewerId;    // Để check ẩn nút phân công
    private String reviewerName;

    private Double reviewScore;
    private Double instructorScore;
    private Double councilScore;

    private String reviewComment;
}