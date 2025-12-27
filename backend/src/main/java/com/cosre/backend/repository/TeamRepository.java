package com.cosre.backend.repository;

import com.cosre.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    // Tìm tất cả các nhóm thuộc về một lớp học cụ thể
    List<Team> findByClassRoom_Id(Long classId);
}