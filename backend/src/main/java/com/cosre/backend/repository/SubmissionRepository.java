package com.cosre.backend.repository;

import com.cosre.backend.entity.Assignment;
import com.cosre.backend.entity.Submission;
import com.cosre.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    // 1. Tìm bài nộp của một sinh viên cụ thể cho một bài tập (để check xem SV đã nộp chưa)
    Optional<Submission> findByAssignmentAndStudent(Assignment assignment, User student);

    // 2. Lấy danh sách tất cả bài nộp của một bài tập (để Giảng viên chấm điểm)
    List<Submission> findByAssignment(Assignment assignment);

    // --- HÀM MỚI THÊM (Cho LecturerService) ---
    // Tìm bài nộp dựa trên ID của bài tập và ID của sinh viên
    Optional<Submission> findFirstByAssignment_IdAndStudent_IdOrderBySubmittedAtDesc(Long assignmentId, Long studentId);
}