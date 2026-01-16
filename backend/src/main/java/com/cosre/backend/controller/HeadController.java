package com.cosre.backend.controller;

import com.cosre.backend.dto.head.HeadDashboardStats; // [MỚI] Import DTO thống kê
import com.cosre.backend.dto.head.HeadLecturerDTO;
import com.cosre.backend.dto.head.LecturerSubmissionDTO;
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

    // [MỚI] API Lấy thống kê cho Dashboard (Số đề tài chờ duyệt & Số giảng viên)
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
}