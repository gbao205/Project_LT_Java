package com.cosre.backend.dto.head;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class LecturerSubmissionDTO {
    private Long lecturerId;
    private String lecturerName;
    private String email;
    private int pendingCount;
    private List<HeadProjectDTO> proposals;
}