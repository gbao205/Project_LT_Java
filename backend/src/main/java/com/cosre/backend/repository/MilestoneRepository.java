package com.cosre.backend.repository;

import com.cosre.backend.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    // Lấy danh sách Milestone theo Class ID
    List<Milestone> findByClassRoom_Id(Long classId);
}