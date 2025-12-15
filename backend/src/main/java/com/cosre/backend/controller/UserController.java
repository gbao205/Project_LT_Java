package com.cosre.backend.controller;

import com.cosre.backend.entity.User;
import com.cosre.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

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
}