package com.cosre.backend.entity;

public enum TaskStatus {
    TO_DO,          // Cần làm (Trạng thái mặc định)
    IN_PROGRESS,    // Đang làm
    REVIEW,         // Chờ Review/Duyệt
    DONE,           // Đã hoàn thành
    CANCELED        // Đã hủy
}
