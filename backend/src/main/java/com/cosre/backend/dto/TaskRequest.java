package com.cosre.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class TaskRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Task phải thuộc về một nhóm")
    private Long teamId;

    private Long milestoneId;

    private Long assignedToId;

    private LocalDateTime dueDate;
}