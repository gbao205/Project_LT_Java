package com.cosre.backend.entity;

public enum Role {
    ADMIN,              // Quản trị viên hệ thống
    HEAD_DEPARTMENT,    // Trưởng bộ môn (Duyệt đề tài)
    STAFF,              // Giáo vụ (Quản lý lớp, tài khoản)
    LECTURER,           // Giảng viên
    STUDENT             // Sinh viên
}