package com.cosre.backend.dto.lecturer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssignmentDTO {
    private Long id;              // ID bài tập
    private String title;         // Tên bài tập
    private String description;   // Đề bài
    private String deadline;      // Hạn nộp
    private String status;        // SUBMITTED, MISSING, LATE, PENDING
    private String submissionDate;// Ngày nộp thực tế
    private String submissionFile;// Link file nộp (hoặc tên file)
    private BigDecimal score;     // Điểm số
    private String feedback;      // Nhận xét của GV
}