package com.cosre.backend.controller;

import com.cosre.backend.entity.User;
import com.cosre.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // 1. Lấy danh sách user
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.getUsers(search));
    }

    // 2. Khóa/Mở khóa user
    @PutMapping("/{id}/status")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }
}