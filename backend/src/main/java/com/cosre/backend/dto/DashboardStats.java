package com.cosre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStats {
    private long totalUsers;
    private long activeUsers;
    private long totalClasses;
    private long totalSubjects;
    private long totalProjects;

    // --- THÊM 2 TRƯỜNG MỚI (Nguyên nhân gây lỗi) ---
    private long pendingRequests;
    private long totalStudents;

    // --- QUAN TRỌNG: Constructor phụ cho code cũ ---
    // Giúp những chỗ code cũ (chỉ truyền 5 tham số) vẫn chạy bình thường mà không bị lỗi
    public DashboardStats(long totalUsers, long activeUsers, long totalClasses, long totalSubjects, long totalProjects) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.totalClasses = totalClasses;
        this.totalSubjects = totalSubjects;
        this.totalProjects = totalProjects;
        // Gán mặc định là 0
        this.pendingRequests = 0;
        this.totalStudents = 0;
    }
}