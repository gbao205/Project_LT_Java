package com.cosre.backend.repository;

import com.cosre.backend.entity.Project;
import com.cosre.backend.entity.ProjectStatus;
import com.cosre.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // 1. Đếm số lượng đề tài của một giảng viên
    int countByOwner(User owner);
    // 2. Đếm số lượng đề tài theo trạng thái
    long countByStatus(ProjectStatus status);
    // 3. Tìm các đề tài mà User này là người phản biện
    List<Project> findByReviewer(User reviewer);
    // Tìm các đề tài do chính giảng viên này tạo (để họ theo dõi)
    List<Project> findByOwner(User owner);
}