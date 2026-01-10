package com.cosre.backend.controller;

import com.cosre.backend.service.LecturerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lecturer") // ✅ Đã sửa lại đường dẫn chuẩn
public class LecturerController {

    @Autowired
    private LecturerService lecturerService;

    // 1. API lấy danh sách lớp đang dạy (Cũ)
    @GetMapping("/classes")
    public ResponseEntity<?> getMyClasses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getMyClasses(email));
    }

    // 2. API lấy danh sách đề tài cần duyệt (MỚI)
    // Gọi từ: ProposalApproval.tsx (fetchData)
    @GetMapping("/proposals")
    public ResponseEntity<?> getProposals() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getProposalsByLecturer(email));
    }

    // 3. API cập nhật trạng thái đề tài (Duyệt / Từ chối) (MỚI)
    // Gọi từ: handleApprove / handleReject
    @PostMapping("/proposals/{projectId}/status")
    public ResponseEntity<?> updateProposalStatus(@PathVariable Long projectId, @RequestBody Map<String, String> body) {
        String status = body.get("status"); // "APPROVED" hoặc "REJECTED"
        String reason = body.get("reason"); // Lý do (nếu từ chối)

        lecturerService.updateProjectStatus(projectId, status, reason);

        return ResponseEntity.ok("Cập nhật trạng thái thành công");
    }
}