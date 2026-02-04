package com.cosre.backend.dto.head;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HeadDashboardStats {
    private long pendingProposals;
    private long totalLecturers;

    private long totalClasses;

    private long totalSubjects;
    private long totalSyllabi;
}