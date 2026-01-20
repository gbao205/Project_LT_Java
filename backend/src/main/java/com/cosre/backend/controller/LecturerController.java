package com.cosre.backend.controller;

import com.cosre.backend.dto.lecturer.ProposalDTO;
import com.cosre.backend.dto.lecturer.LecturerClassDetailDTO;
import com.cosre.backend.service.LecturerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lecturer")
public class LecturerController {

    @Autowired
    private LecturerService lecturerService;

    // 1. API lấy danh sách lớp đang dạy
    @GetMapping("/classes")
    public ResponseEntity<List<LecturerClassDetailDTO>> getMyClasses() {
        System.out.println(">>> ĐÂY LÀ PHIÊN BẢN MỚI 2024 - ĐÃ UPDATE DTO <<<");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getMyClasses(email));
    }

    // 2. API lấy danh sách đề tài cần duyệt (Sinh viên gửi)
    @GetMapping("/proposals")
    public ResponseEntity<?> getProposals() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getProposalsByLecturer(email));
    }

    // 3. API cập nhật trạng thái đề tài (Duyệt/Từ chối)
    @PostMapping("/proposals/{projectId}/status")
    public ResponseEntity<?> updateProposalStatus(@PathVariable Long projectId, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String reason = body.get("reason");
        lecturerService.updateProjectStatus(projectId, status, reason);
        return ResponseEntity.ok("Cập nhật trạng thái thành công");
    }

    // 4. API xem danh sách đề tài cần phản biện
    @GetMapping("/reviews")
    public ResponseEntity<?> getReviewProjects() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getAssignedReviewProjects(email));
    }

    // 5. API TẠO ĐỀ TÀI MỚI (ĐÃ SỬA LỖI ĐỎ)
    @PostMapping("/submit-proposal")
    public ResponseEntity<?> createProposal(@RequestBody ProposalDTO proposalDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // ✅ THAY ĐỔI Ở ĐÂY: Truyền thêm 'null' vào tham số ở giữa (đại diện cho file)
        // Vì Frontend hiện tại đang gửi JSON, chưa gửi File.
        lecturerService.createProposal(proposalDTO, null, email);

        return ResponseEntity.ok(Map.of("message", "Gửi đề tài thành công!"));
    }

    // 6. API LẤY DANH SÁCH ĐỀ TÀI CỦA TÔI
    @GetMapping("/my-proposals")
    public ResponseEntity<?> getMyCreatedProposals() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getMyCreatedProposals(email));
    }
}