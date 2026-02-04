package com.cosre.backend.controller;

import com.cosre.backend.dto.head.HeadDashboardStats;
import com.cosre.backend.dto.head.HeadLecturerDTO;
import com.cosre.backend.dto.head.HeadProjectDTO; // [MỚI] Import DTO update đề tài
import com.cosre.backend.dto.head.LecturerSubmissionDTO;
import com.cosre.backend.dto.staff.ClassResponseDTO; // [MỚI] Import DTO lớp học
import com.cosre.backend.dto.staff.SubjectDTO;       // [MỚI] Import DTO môn học
import com.cosre.backend.dto.staff.SyllabusListDTO;  // [MỚI] Import DTO đề cương
import com.cosre.backend.service.HeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/head")
@RequiredArgsConstructor
public class HeadController {

    private final HeadService headService;

    // Lấy danh sách đề tài (Chỉ Head được gọi)
    @GetMapping("/proposals")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<List<LecturerSubmissionDTO>> getProposals() {
        return ResponseEntity.ok(headService.getProposalsGroupedByLecturer());
    }

    @GetMapping("/lecturers")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<List<HeadLecturerDTO>> getLecturers() {
        return ResponseEntity.ok(headService.getAllLecturers());
    }

    // API Lấy thống kê cho Dashboard
    @GetMapping("/stats")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<HeadDashboardStats> getStats() {
        return ResponseEntity.ok(headService.getDashboardStats());
    }

    // Duyệt đề tài
    @PostMapping("/proposals/{id}/approve")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<?> approveProposal(@PathVariable Long id) {
        headService.approveProposal(id);
        return ResponseEntity.ok(Map.of("message", "Đã duyệt đề tài thành công"));
    }

    // Từ chối đề tài
    @PostMapping("/proposals/{id}/reject")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<?> rejectProposal(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        headService.rejectProposal(id, reason);
        return ResponseEntity.ok(Map.of("message", "Đã từ chối đề tài"));
    }

    // --- PHÂN CÔNG PHẢN BIỆN  ---

    @PostMapping("/assign-reviewer")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<?> assignReviewer(@RequestBody AssignReviewerRequest request) {
        headService.assignReviewer(request.getProjectId(), request.getReviewerId());
        return ResponseEntity.ok(Map.of("message", "Phân công phản biện thành công!"));
    }

    // ==================================================================================
    // [MỚI BỔ SUNG] CÁC API QUẢN LÝ LỚP HỌC, MÔN HỌC, ĐỀ CƯƠNG VÀ CẬP NHẬT ĐỀ TÀI
    // ==================================================================================

    // 1. Xem danh sách tất cả lớp học
    @GetMapping("/classes")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<List<ClassResponseDTO>> getAllClasses() {
        return ResponseEntity.ok(headService.getAllClasses());
    }

    // 2. Xem danh sách tất cả môn học
    @GetMapping("/subjects")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        return ResponseEntity.ok(headService.getAllSubjects());
    }

    // 3. Xem danh sách tất cả đề cương (Syllabus)
    @GetMapping("/syllabi")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<List<SyllabusListDTO>> getAllSyllabi() {
        return ResponseEntity.ok(headService.getAllSyllabi());
    }

    // 4. Cập nhật thông tin đề tài (kể cả sau khi đã duyệt)
    @PutMapping("/proposals/{id}")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT')")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody HeadProjectDTO projectDTO) {
        headService.updateApprovedProject(id, projectDTO);
        return ResponseEntity.ok(Map.of("message", "Cập nhật đề tài thành công"));
    }

    // ==================================================================================

    // DTO hứng request
    @lombok.Data
    static class AssignReviewerRequest {
        private Long projectId;
        private Long reviewerId;
    }
}