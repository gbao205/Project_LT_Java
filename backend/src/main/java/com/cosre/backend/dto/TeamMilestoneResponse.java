// File: src/main/java/com/cosre/backend/dto/TeamMilestoneResponse.java
package com.cosre.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

import java.util.List;

@Data
@Builder
public class TeamMilestoneResponse {
    private Long id; // Milestone ID
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private boolean completed; // Trạng thái của nhóm
    private String answer;    // Câu trả lời của nhóm
    private LocalDateTime completedAt;
    private String feedback;
    private List<Long> completedTaskIds;
}