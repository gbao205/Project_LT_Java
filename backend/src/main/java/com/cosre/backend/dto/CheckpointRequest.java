package com.cosre.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CheckpointRequest {
    private String title;
    private String content;
    private LocalDateTime dueDate;
    private Long assignedToId; // ID của người phụ trách
}