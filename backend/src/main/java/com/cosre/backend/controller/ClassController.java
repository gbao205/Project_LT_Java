package com.cosre.backend.controller;

import com.cosre.backend.dto.ClassRequest;
import com.cosre.backend.entity.*;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.*;
import com.cosre.backend.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClassController {

    private final ClassService classService;
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;

    @Autowired private CourseMaterialRepository materialRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private SubmissionRepository submissionRepository;
    
    // ✅ THÊM REPO ĐỂ LẤY ĐIỂM SỐ (Phần của bạn)
    @Autowired private EvaluationRepository evaluationRepository;

    // =================================================================
    // CÁC API CƠ BẢN (KHÔNG ĐỤNG VÀO)
    // =================================================================
    @GetMapping
    public ResponseEntity<List<ClassRoom>> getAll() {
        return ResponseEntity.ok(classService.getAllClasses());
    }

    @PostMapping
    public ResponseEntity<ClassRoom> create(@RequestBody ClassRequest request) {
        return ResponseEntity.ok(classService.createClass(request));
    }

    @GetMapping("/registration")
    public ResponseEntity<?> getRegistrationList() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.getClassesForRegistration(email));
    }

    @PostMapping("/{classId}/enroll")
    public ResponseEntity<?> enrollClass(@PathVariable Long classId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        classService.registerClass(classId, email);
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công!"));
    }

    @PostMapping("/{classId}/cancel")
    public ResponseEntity<?> cancelClass(@PathVariable Long classId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        classService.cancelRegistration(classId, email);
        return ResponseEntity.ok(Map.of("message", "Hủy đăng ký thành công!"));
    }

    @GetMapping("/my-classes")
    public ResponseEntity<List<ClassRoom>> getMyClasses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.getMyClasses(email));
    }

    // =================================================================
    // 🔥 [CẬP NHẬT] API XEM CHI TIẾT (ĐÃ FIX: KÈM ĐIỂM SỐ)
    // =================================================================
    @GetMapping("/{id}/details")
    public ResponseEntity<?> getClassDetails(@PathVariable Long id) {
        // 1. Tìm lớp học
        ClassRoom classRoom = classRoomRepository.findById(id)
                .orElseThrow(() -> new AppException("Lớp không tồn tại", HttpStatus.NOT_FOUND));

        // 🔥 Lấy thông tin sinh viên hiện tại để tìm điểm số
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email).orElse(null);

        // 2. Lấy danh sách tài liệu
        List<CourseMaterial> materials = materialRepository.findByClassRoom(classRoom);

        // 3. Lấy danh sách bài tập
        List<Assignment> assignments = assignmentRepository.findByClassRoom(classRoom);

        // Map Class Info
        Map<String, Object> classInfo = new HashMap<>();
        classInfo.put("id", classRoom.getId());
        classInfo.put("name", classRoom.getName());
        classInfo.put("subjectCode", classRoom.getSubject() != null ? classRoom.getSubject().getSubjectCode() : "");
        classInfo.put("subjectName", classRoom.getSubject() != null ? classRoom.getSubject().getName() : "");
        classInfo.put("lecturerName", classRoom.getLecturer() != null ? classRoom.getLecturer().getFullName() : "N/A");
        classInfo.put("semester", classRoom.getSemester());

        // Map Materials
        List<Map<String, Object>> materialsList = materials.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("title", m.getTitle());
            map.put("description", m.getDescription());
            map.put("uploadDate", m.getUploadDate()); 

            String rawUrl = m.getFileUrl();
            if (rawUrl != null) {
                String fileName = rawUrl.replace("/uploads/", "")
                                    .replace("uploads/", "")
                                    .replace("/api/", "")
                                    .replace("/", "");
                
                map.put("fileUrl", "/uploads/" + fileName);
            }
            return map;
        }).collect(Collectors.toList());

        // 🔥 Map Assignments (CÓ KÈM ĐIỂM SỐ - Logic mới của bạn)
        List<Map<String, Object>> assignmentsList = assignments.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("description", a.getDescription());
            map.put("deadline", a.getDeadline());

            // 👇 LOGIC LẤY ĐIỂM
            if (student != null) {
                Evaluation eval = evaluationRepository
                        .findFirstByAssignment_IdAndStudent_IdOrderByEvaluatedAtDesc(a.getId(), student.getId())
                        .orElse(null);

                if (eval != null) {
                    map.put("score", eval.getScore());     // Gửi điểm
                    map.put("feedback", eval.getComment()); // Gửi nhận xét
                } else {
                    map.put("score", null);
                    map.put("feedback", null);
                }

                Submission sub = submissionRepository
                    .findFirstByAssignment_IdAndStudent_IdOrderBySubmittedAtDesc(a.getId(), student.getId())
                    .orElse(null);
        
                if (sub != null) {
                    Map<String, Object> subData = new HashMap<>();
                    subData.put("submissionText", sub.getSubmissionText());
                    subData.put("fileUrl", sub.getFileUrl());
                    subData.put("submittedAt", sub.getSubmittedAt());
                    map.put("submission", subData);
                } else {
                    map.put("submission", null);
                }
            }
            return map;
        }).collect(Collectors.toList());

        // 4. Đóng gói trả về
        Map<String, Object> response = new HashMap<>();
        response.put("classInfo", classInfo);
        response.put("materials", materialsList);
        response.put("assignments", assignmentsList);

        return ResponseEntity.ok(response);
    }

    // =================================================================
    // ⚠️ KHÔI PHỤC LẠI 2 HÀM CỦA GIẢNG VIÊN (ĐỂ KHÔNG BỊ LỖI CODE CŨ)
    // =================================================================
    
    // 2. Upload Tài liệu (Chỉ giảng viên)
    @PostMapping("/{id}/materials")
    public ResponseEntity<?> uploadMaterial(@PathVariable Long id, @RequestBody CourseMaterial material) {
        ClassRoom classRoom = classRoomRepository.findById(id).orElseThrow();
        material.setClassRoom(classRoom);
        material.setUploadDate(LocalDateTime.now());
        materialRepository.save(material);
        return ResponseEntity.ok(material);
    }

    // 3. Tạo Bài tập (Chỉ giảng viên)
    @PostMapping("/{id}/assignments")
    public ResponseEntity<?> createAssignment(@PathVariable Long id, @RequestBody Assignment assignment) {
        ClassRoom classRoom = classRoomRepository.findById(id).orElseThrow();
        assignment.setClassRoom(classRoom);
        assignmentRepository.save(assignment);
        return ResponseEntity.ok(assignment);
    }

    // =================================================================
    // 4. API NỘP BÀI TẬP (CHO SINH VIÊN)
    // =================================================================
    @PostMapping(value = "/assignments/{assignmentId}/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "submissionText", required = false) String submissionText,
            @RequestParam(value = "comment", required = false) String comment,
            // Nhận thêm cờ xóa file từ Frontend
            @RequestParam(value = "deleteOldFile", defaultValue = "false") boolean deleteOldFile) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Bài tập không tồn tại"));

        Optional<Submission> existingSubmission = submissionRepository
                .findFirstByAssignment_IdAndStudent_IdOrderBySubmittedAtDesc(assignmentId, student.getId());

        Submission submission;
        String finalFileUrl;

        if (existingSubmission.isPresent()) {
            submission = existingSubmission.get();
            finalFileUrl = submission.getFileUrl(); 
        } else {
            submission = new Submission();
            submission.setStudent(student);
            submission.setAssignment(assignment);
            finalFileUrl = null;
        }
        
        // TH1: Sinh viên upload file mới
        if (file != null && !file.isEmpty()) {
            try {
                // Xóa file cũ trên đĩa nếu tồn tại
                if (submission.getFileUrl() != null) {
                    deletePhysicalFile(submission.getFileUrl());
                }

                // Lưu file mới
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                java.nio.file.Path path = java.nio.file.Paths.get("uploads/" + fileName);
                java.nio.file.Files.createDirectories(path.getParent());
                java.nio.file.Files.copy(file.getInputStream(), path);
                finalFileUrl = "/uploads/" + fileName;
            } catch (java.io.IOException e) {
                return ResponseEntity.status(500).body("Lỗi khi lưu file");
            }
        } 
        // TH2: Không có file mới nhưng sinh viên chủ động nhấn "Xóa file cũ"
        else if (deleteOldFile) {
            if (submission.getFileUrl() != null) {
                deletePhysicalFile(submission.getFileUrl());
            }
            finalFileUrl = null;
        }

        // Cập nhật thông tin nộp bài
        submission.setFileUrl(finalFileUrl);
        submission.setSubmissionText(submissionText);
        submission.setStudentComment(comment);
        submission.setSubmittedAt(LocalDateTime.now());

        submissionRepository.save(submission);
        
        String msg = existingSubmission.isPresent() ? "Cập nhật bài làm thành công!" : "Nộp bài thành công!";
        return ResponseEntity.ok(Map.of("message", msg));
    }

    private void deletePhysicalFile(String fileUrl) {
        try {
            // fileUrl thường là "/uploads/name.pdf", cần bỏ dấu "/" ở đầu để Path hiểu
            java.nio.file.Path path = java.nio.file.Paths.get(fileUrl.substring(1));
            java.nio.file.Files.deleteIfExists(path);
        } catch (Exception e) {
            System.err.println("Không thể xóa file cũ: " + e.getMessage());
        }
    }
}