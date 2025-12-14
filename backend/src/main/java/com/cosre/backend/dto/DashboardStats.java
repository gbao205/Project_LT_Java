package com.cosre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStats {
    private long totalUsers;
    private long activeUsers;
    private long totalClasses;
    private long totalSubjects;
    private long totalProjects;
}