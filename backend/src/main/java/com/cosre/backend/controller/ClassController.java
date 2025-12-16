package com.cosre.backend.controller;

// 1. Import các DTO và Entity
import com.cosre.backend.dto.ClassRequest;
import com.cosre.backend.entity.*;
import com.cosre.backend.entity.ClassRoom;

// 2. Import các Exception và Repository
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.*;
import com.cosre.backend.service.ClassService;

// 3. Import các thư viện Java & Spring
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public ResponseEntity<List<ClassRoom>> getAll() {
        return ResponseEntity.ok(classService.getAllClasses());
    }

    @PostMapping
    public ResponseEntity<ClassRoom> create(@RequestBody ClassRequest request) {
        return ResponseEntity.ok(classService.createClass(request));
    }

    // API lấy danh sách đăng ký (cho sinh viên)
    @GetMapping("/registration")
    public ResponseEntity<?> getRegistrationList() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.getClassesForRegistration(email));
    }

    // API Đăng ký
    @PostMapping("/{classId}/enroll")
    public ResponseEntity<?> enrollClass(@PathVariable Long classId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        classService.registerClass(classId, email);
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công!"));
    }

    // API Hủy đăng ký
    @PostMapping("/{classId}/cancel")
    public ResponseEntity<?> cancelClass(@PathVariable Long classId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        classService.cancelRegistration(classId, email);
        return ResponseEntity.ok(Map.of("message", "Hủy đăng ký thành công!"));
    }

    // API Lấy danh sách lớp của sinh viên đang đăng nhập
    @GetMapping("/my-classes")
    public ResponseEntity<List<ClassRoom>> getMyClasses() {
        // Lấy email từ token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.getMyClasses(email));
    }

    @Autowired
    private CourseMaterialRepository materialRepository;
    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired
    private SubmissionRepository submissionRepository;

    private final com.cosre.backend.repository.ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;

    // 1. Lấy chi tiết lớp học (Thông tin + Tài liệu + Bài tập)
    @GetMapping("/{id}/details")
    public ResponseEntity<?> getClassDetails(@PathVariable Long id) {
        ClassRoom classRoom = classRoomRepository.findById(id)
                .orElseThrow(() -> new AppException("Lớp không tồn tại", HttpStatus.NOT_FOUND));

        List<CourseMaterial> materials = materialRepository.findByClassRoom(classRoom);
        List<Assignment> assignments = assignmentRepository.findByClassRoom(classRoom);

        Map<String, Object> response = new HashMap<>();
        response.put("classInfo", classRoom);
        response.put("materials", materials);
        response.put("assignments", assignments);

        return ResponseEntity.ok(response);
    }

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

    // 4. Nộp bài (Sinh viên)
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(@PathVariable Long assignmentId, @RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email).orElseThrow();
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow();

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