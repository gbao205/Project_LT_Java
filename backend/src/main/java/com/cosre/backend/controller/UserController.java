package com.cosre.backend.controller;

import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.UserRepository;
import com.cosre.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // ==========================================
    // PHẦN 1: CÁC API QUẢN LÝ USER (CŨ)
    // ==========================================

    // 1. Lấy danh sách user
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.getAllUsers(search));
    }

    // 2. Khóa/Mở khóa user
    @PutMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok().build();
    }

    // 3. API Reset Password
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        userService.resetPassword(id, newPassword);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }

    // 4. API Update Info
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // 5. API Xóa user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Xóa tài khoản thành công!"));
    }

    // ==========================================
    // PHẦN 2: API DANH BẠ CHAT (ĐÃ CẬP NHẬT SẮP XẾP)
    // ==========================================

    @GetMapping("/contacts")
    public ResponseEntity<?> getChatContacts() {
        // 1. Lấy thông tin người dùng hiện tại từ Security Context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth.getName();

        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy người dùng."));

        Role myRole = currentUser.getRole();
        List<Role> allowedRoles = new ArrayList<>();

        // 2. CẬP NHẬT MA TRẬN PHÂN QUYỀN CHAT THEO YÊU CẦU
        switch (myRole) {
            case ADMIN:
                // ADMIN nhắn được cho Head và Staff
                allowedRoles.add(Role.HEAD_DEPARTMENT);
                allowedRoles.add(Role.STAFF);
                break;

            case HEAD_DEPARTMENT:
                // Head nhắn được cho Staff, Lecturer, Admin và Head khác
                allowedRoles.add(Role.STAFF);
                allowedRoles.add(Role.LECTURER);
                allowedRoles.add(Role.ADMIN);
                allowedRoles.add(Role.HEAD_DEPARTMENT);
                break;

            case STAFF:
                // Staff nhắn được cho Head, Lecturer, Admin và Staff khác
                allowedRoles.add(Role.HEAD_DEPARTMENT);
                allowedRoles.add(Role.LECTURER);
                allowedRoles.add(Role.ADMIN);
                allowedRoles.add(Role.STAFF);
                break;

            case LECTURER:
                // Lecturer nhắn được cho Lecturer khác, Head và Student
                allowedRoles.add(Role.LECTURER);
                allowedRoles.add(Role.HEAD_DEPARTMENT);
                allowedRoles.add(Role.STUDENT);
                break;

            case STUDENT:
                // Student nhắn được cho Student khác và Lecturer
                allowedRoles.add(Role.STUDENT);
                allowedRoles.add(Role.LECTURER);
                break;
        }

        // 3. Lấy danh sách ĐÃ SẮP XẾP từ Service, sau đó mới lọc theo Role

        List<User> sortedUsers = userService.getSortedContacts(currentEmail); // Gọi hàm đã viết ở bước trước

        List<User> finalContacts = sortedUsers.stream()
                .filter(u -> allowedRoles.contains(u.getRole())) // Chỉ giữ lại Role cho phép
                .collect(Collectors.toList());

        return ResponseEntity.ok(finalContacts);
    }
}