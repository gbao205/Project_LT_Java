package com.cosre.backend.dto.student;

import lombok.Data;

@Data
public class ProjectRegistrationRequest {
    private Long classId;
    private String projectName;
    private String description;
    // Nếu chọn đề tài có sẵn thì gửi ID, nếu đề xuất mới thì để null
    private Long existingProjectId;
}
