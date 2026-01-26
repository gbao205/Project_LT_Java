package com.cosre.backend.controller;

import com.cosre.backend.dto.lecturer.LecturerClassDetailDTO;
import com.cosre.backend.dto.lecturer.ProposalDTO;
import com.cosre.backend.dto.lecturer.StudentAssignmentDTO; // ✅ Import DTO này
import com.cosre.backend.service.LecturerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // ✅ Import để nhận file

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lecturer")
public class LecturerController {

    @Autowired
    private LecturerService lecturerService;

    // =================================================================
    // 1. QUẢN LÝ LỚP HỌC & DASHBOARD
    // =================================================================

    // 1. API lấy danh sách lớp đang dạy
    @GetMapping("/classes")
    public ResponseEntity<List<LecturerClassDetailDTO>> getMyClasses() {
        System.out.println(">>> ĐÂY LÀ PHIÊN BẢN MỚI 2024 - ĐÃ UPDATE DTO <<<");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getMyClasses(email));
    }

    // =================================================================
    // 2. QUẢN LÝ ĐỀ TÀI (PROPOSALS)
    // =================================================================

    // 2. API lấy danh sách đề tài sinh viên gửi để duyệt
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

    // 4. API tạo đề tài mới (Đã sửa để truyền null vào file cho tương thích code cũ)
    @PostMapping("/submit-proposal")
    public ResponseEntity<?> createProposal(@RequestBody ProposalDTO proposalDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        // Frontend hiện tại gửi JSON, chưa gửi file -> Truyền null
        lecturerService.createProposal(proposalDTO, null, email);
        return ResponseEntity.ok(Map.of("message", "Gửi đề tài thành công!"));
    }

    // 5. API lấy danh sách đề tài TÔI đã tạo
    @GetMapping("/my-proposals")
    public ResponseEntity<?> getMyCreatedProposals() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getMyCreatedProposals(email));
    }

    // =================================================================
    // 3. PHẢN BIỆN (REVIEWS)
    // =================================================================

    // 6. API xem danh sách đề tài cần phản biện
    @GetMapping("/reviews")
    public ResponseEntity<?> getReviewProjects() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(lecturerService.getAssignedReviewProjects(email));
    }

    // 7. API chấm điểm phản biện
    @PostMapping("/reviews/{projectId}/grade")
    public ResponseEntity<?> gradeReviewProject(@PathVariable Long projectId, @RequestBody Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Double score = Double.valueOf(body.get("score").toString());
        String comment = (String) body.get("comment");

        lecturerService.gradeReviewProject(projectId, score, comment, email);
        return ResponseEntity.ok(Map.of("message", "Chấm điểm thành công!"));
    }

    // =================================================================
    // 4. GIAO BÀI TẬP & CHẤM ĐIỂM (CÁC API MỚI BỔ SUNG) 🚀
    // =================================================================

    // 8. API Giao bài tập (Nhận FormData từ ClassManager.tsx)
    @PostMapping(value = "/classes/{classId}/assignments", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createAssignment(
            @PathVariable Long classId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("type") String type,
            @RequestParam("deadline") String deadline,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        lecturerService.createAssignment(classId, title, description, type, deadline, file);
        return ResponseEntity.ok(Map.of("message", "Giao bài tập thành công!"));
    }

    // 9. API Lấy danh sách bài tập & bài làm của sinh viên (Cho LecturerTeamDetail.tsx)
    @GetMapping("/student-assignments/{studentId}/{classId}")
    public ResponseEntity<List<StudentAssignmentDTO>> getStudentAssignments(
            @PathVariable Long studentId,
            @PathVariable Long classId) {
        return ResponseEntity.ok(lecturerService.getStudentAssignments(studentId, classId));
    }

    // 10. API Chấm điểm bài tập (Khi bấm "Lưu Kết Quả")
    // Lưu ý: Frontend đang gọi /evaluations/assignment, nhưng vì ở trong LecturerController
    // nên đường dẫn thực tế sẽ là /api/lecturer/evaluations/assignment
    // Bạn cần đảm bảo Frontend gọi đúng đường dẫn này.
    @PostMapping("/evaluations/assignment")
    public ResponseEntity<?> gradeAssignment(@RequestBody Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long assignmentId = Long.valueOf(body.get("assignmentId").toString());
        Double score = Double.valueOf(body.get("score").toString());
        String comment = (String) body.get("comment");

        lecturerService.gradeAssignment(studentId, assignmentId, score, comment);
        return ResponseEntity.ok(Map.of("message", "Lưu điểm thành công!"));
    }

    // 11. API Upload tài liệu học tập
    @PostMapping(value = "/classes/{classId}/materials", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadMaterial(
            @PathVariable Long classId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("file") MultipartFile file // Bắt buộc có file
    ) {
        lecturerService.uploadMaterial(classId, title, description, file);
        return ResponseEntity.ok(Map.of("message", "Upload tài liệu thành công!"));
    }

    // 12. API Lấy danh sách tài liệu
    @GetMapping("/classes/{classId}/materials")
    public ResponseEntity<?> getClassMaterials(@PathVariable Long classId) {
        return ResponseEntity.ok(lecturerService.getClassMaterials(classId));
    }
}