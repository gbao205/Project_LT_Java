package com.cosre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {
    private Long id;              // ID của TeamMember
    private StudentInfo student;  // Thông tin sinh viên
    private String role;          // LEADER hoặc MEMBER
    private BigDecimal finalGrade; // Điểm tổng kết

    @Data
    @Builder
    @AllArgsConstructor
    public static class StudentInfo {
        private Long id;
        private String fullName;
        private String email;
        private String code;
    }
}