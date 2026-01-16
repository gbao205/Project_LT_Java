package com.cosre.backend.dto.head;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HeadDashboardStats {
    private long pendingProposals; // Số đề tài chờ duyệt
    private long totalLecturers;   // Tổng số giảng viên
}