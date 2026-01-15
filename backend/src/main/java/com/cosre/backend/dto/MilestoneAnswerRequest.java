package com.cosre.backend.dto;

import java.util.List;
import lombok.Data;

@Data
public class MilestoneAnswerRequest {
    private String answer;
    private List<Long> taskIds; // Danh sách ID của các task đã xong
}
