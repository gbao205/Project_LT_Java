package com.cosre.backend.dto;

import com.cosre.backend.entity.TaskStatus;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class StatusChangeRequest {
    @NotNull(message = "Trạng thái mới không được để trống")
    private TaskStatus newStatus;
}