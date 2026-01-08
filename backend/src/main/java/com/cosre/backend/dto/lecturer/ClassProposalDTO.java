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
public class ClassProposalDTO {
    private Long id; // Class ID
    private String name; // Class Name
    private String semester;
    private int pendingCount; // Số lượng đề tài chờ duyệt
    private List<com.cosre.backend.dto.lecturer.ProposalDTO> proposals;
}