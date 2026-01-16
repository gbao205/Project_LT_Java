package com.cosre.backend.repository;

import com.cosre.backend.entity.Project;
import com.cosre.backend.entity.ProjectStatus; // Nhớ Import cái này
import com.cosre.backend.entity.User;          // Nhớ Import cái này
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // 1. Đếm số lượng đề tài của một giảng viên
    int countByOwner(User owner);

    // 2. Đếm số lượng đề tài theo trạng thái
    long countByStatus(ProjectStatus status);
}