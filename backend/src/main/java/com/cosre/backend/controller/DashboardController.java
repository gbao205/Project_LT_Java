package com.cosre.backend.controller;

import com.cosre.backend.dto.DashboardStats;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.ProjectRepository;
import com.cosre.backend.repository.SubjectRepository;
import com.cosre.backend.repository.UserRepository;
import com.cosre.backend.service.LecturerService; // Import Service mới
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder; // Import Security
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

    // 1. Inject thêm LecturerService để lấy số liệu giảng viên
    private final LecturerService lecturerService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        // 2. Lấy Email người đang đăng nhập
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 3. Tìm User trong DB để check Role
        User user = userRepository.findByEmail(email).orElse(null);

        // 4. Logic Phân Luồng:
        // Nếu là Giảng viên hoặc Trưởng bộ môn -> Gọi Service riêng
        if (user != null && (user.getRole() == Role.LECTURER || user.getRole() == Role.HEAD_DEPARTMENT)) {
            return ResponseEntity.ok(lecturerService.getLecturerStats(email));
        }

        // 5. Logic Cũ (Admin/Staff): Giữ nguyên cách đếm tổng
        long users = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long classes = classRoomRepository.count();
        long subjects = subjectRepository.count();
        long projects = projectRepository.count();

        // Trả về DTO (Lưu ý: Nếu DTO bạn đã thêm trường cho Giảng viên thì Admin điền 0 ở các trường đó)
        return ResponseEntity.ok(new DashboardStats(
                users,
                activeUsers,
                classes,
                subjects,
                projects,
                0L, // pendingRequests (Admin không có)
                0L  // totalStudents (Admin không có)
        ));
    }
}