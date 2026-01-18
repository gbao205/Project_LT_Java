package com.cosre.backend.dto.lecturer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposalDTO {
    private Long id;
    private String groupName;
    private List<String> students;
    private String title;
    private String titleEn;
    private String description;
    private String technology;
    private String status;
    private String submittedDate;
    private Integer maxStudents;
}