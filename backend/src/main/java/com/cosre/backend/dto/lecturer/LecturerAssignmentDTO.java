package com.cosre.backend.dto.lecturer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LecturerAssignmentDTO {
    private Long id;
    private String title;
    private String type;     // Ví dụ: "CLASS_ASSIGNMENT", "GROUP_PROJECT"
    private String dueDate;  // Hạn nộp (dạng chuỗi ngày tháng)
    private String status;   // Ví dụ: "ACTIVE", "CLOSED"
}