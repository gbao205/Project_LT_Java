package com.cosre.backend.repository;

import com.cosre.backend.entity.Task;
import com.cosre.backend.entity.TaskStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Tìm kiếm Task theo Team ID
    List<Task> findByTeamId(Long teamId);

    // Đếm số lượng nhiệm vụ theo Student ID và trạng thái không phải là DONE
    long countByAssignedToIdAndStatusNot(Long userId, TaskStatus status);
}
