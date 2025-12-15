package com.cosre.backend.controller;

import com.cosre.backend.dto.ClassRequest;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}