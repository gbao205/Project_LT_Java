package com.cosre.backend.repository;

import com.cosre.backend.entity.Assignment;
import com.cosre.backend.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    // Tìm tất cả bài tập thuộc về một lớp học cụ thể
    List<Assignment> findByClassRoom(ClassRoom classRoom);
}