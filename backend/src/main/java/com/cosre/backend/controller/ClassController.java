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
            map.put("fileUrl", m.getFileUrl());
            map.put("uploadDate", m.getUploadDate()); 
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
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(@PathVariable Long assignmentId, @RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Bài tập không tồn tại"));

        Submission submission = Submission.builder()
                .student(student)
                .assignment(assignment)
                .fileUrl(body.get("fileUrl"))
                .studentComment(body.get("comment"))
                .submittedAt(LocalDateTime.now())
                .build();

        submissionRepository.save(submission);
        return ResponseEntity.ok(Map.of("message", "Nộp bài thành công!"));
    }
}