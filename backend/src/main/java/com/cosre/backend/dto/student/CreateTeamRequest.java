package com.cosre.backend.dto.student;

import lombok.Data;

@Data
public class CreateTeamRequest {
    private String teamName;
    private Long classId; // Sinh viên tạo nhóm trong lớp nào
}
