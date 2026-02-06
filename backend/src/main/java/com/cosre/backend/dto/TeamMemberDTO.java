package com.cosre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String role; // Sẽ chứa giá trị "LEADER" hoặc "MEMBER"
}