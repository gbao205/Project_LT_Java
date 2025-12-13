package com.cosre.backend.controller;

import com.cosre.backend.dto.DashboardStats;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.ProjectRepository;
import com.cosre.backend.repository.SubjectRepository;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final SubjectRepository subjectRepository;
    private final ProjectRepository projectRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        // Sử dụng hàm .count() có sẵn của JPA để đếm nhanh
        long users = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long classes = classRoomRepository.count();
        long subjects = subjectRepository.count();
        long projects = projectRepository.count();

        return ResponseEntity.ok(new DashboardStats(users, activeUsers, classes, subjects, projects));
    }
}