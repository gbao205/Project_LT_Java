package com.cosre.backend.repository;

import com.cosre.backend.entity.Checkpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CheckpointRepository extends JpaRepository<Checkpoint, Long> {
    // Tìm tất cả checkpoint thuộc về một nhóm
    List<Checkpoint> findByTeamId(Long teamId);
    
    // Tìm các checkpoint chưa hoàn thành của nhóm
    List<Checkpoint> findByTeamIdAndIsDoneFalse(Long teamId);
}