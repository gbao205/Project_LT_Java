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
    // PHẦN 2: API DANH BẠ CHAT (MỚI - ĐÃ FIX LỖI USERNAME)
    // ==========================================

    @GetMapping("/contacts")
    public ResponseEntity<?> getChatContacts() {
        // 1. Lấy EMAIL người đang đăng nhập (Vì bạn dùng Email làm ID)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth.getName();

        // Tìm user trong DB bằng EMAIL
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        Role myRole = currentUser.getRole();
        List<Role> allowedRoles = new ArrayList<>();

        // 2. MA TRẬN PHÂN QUYỀN CHAT
        switch (myRole) {
            case ADMIN:
                allowedRoles.add(Role.STAFF);
                break;
            case STAFF:
                allowedRoles.add(Role.ADMIN);
                allowedRoles.add(Role.STAFF);
                allowedRoles.add(Role.HEAD_DEPARTMENT);
                allowedRoles.add(Role.LECTURER);
                break;
            case STUDENT:
                allowedRoles.add(Role.LECTURER);
                allowedRoles.add(Role.STUDENT);
                break;
            case LECTURER:
                allowedRoles.add(Role.STUDENT);
                allowedRoles.add(Role.HEAD_DEPARTMENT);
                allowedRoles.add(Role.STAFF);
                allowedRoles.add(Role.LECTURER);
                break;
            case HEAD_DEPARTMENT:
                allowedRoles.add(Role.LECTURER);
                allowedRoles.add(Role.STAFF);
                allowedRoles.add(Role.HEAD_DEPARTMENT);
                break;
        }

        // 3. Lọc danh sách user theo Role cho phép
        List<User> contacts = userRepository.findByRoleIn(allowedRoles);

        // 4. Loại bỏ chính mình ra khỏi danh sách (So sánh bằng EMAIL)
        List<User> finalContacts = contacts.stream()
                .filter(u -> !u.getEmail().equals(currentEmail)) // <--- Đã sửa thành getEmail()
                .collect(Collectors.toList());

        return ResponseEntity.ok(finalContacts);
    }
}