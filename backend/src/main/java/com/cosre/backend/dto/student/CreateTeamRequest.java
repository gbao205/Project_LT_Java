package com.cosre.backend.dto.student;

import lombok.Data;

import java.util.List;

@Data
public class CreateTeamRequest {
    private String teamName;
    private Long classId; // Sinh viên tạo nhóm trong lớp nào
    private List<Long> memberIds;
}
