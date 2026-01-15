package com.cosre.backend.repository;

import com.cosre.backend.entity.TeamMilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface TeamMilestoneStatusRepository extends JpaRepository<TeamMilestoneStatus, Long> {
    // Tìm trạng thái cột mốc cụ thể của một nhóm
    Optional<TeamMilestoneStatus> findByTeamIdAndMilestoneId(Long teamId, Long milestoneId);
    
    // Kiểm tra xem nhóm đã hoàn thành cột mốc này chưa
    boolean existsByTeamIdAndMilestoneIdAndCompletedTrue(Long teamId, Long milestoneId);

    List<TeamMilestoneStatus> findByTeamId(Long teamId);
}