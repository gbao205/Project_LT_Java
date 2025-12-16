package com.cosre.backend.controller;

import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService staffService;

    @PostMapping("/import")
    public ResponseEntity<?> importUsers(
            @RequestParam("file") MultipartFile file,
            @RequestParam("role") String role) {

        try {
            Role targetRole = Role.valueOf(role.toUpperCase());

            if (targetRole != Role.LECTURER && targetRole != Role.STUDENT) {
                throw new AppException("Vai trò này không thể được tạo qua Import (Chỉ Giảng viên/Sinh viên).", HttpStatus.FORBIDDEN);
            }

            List<User> importedUsers = staffService.importUserFromFile(file, targetRole);

            return ResponseEntity.ok(Map.of(
                    "message", "Import tài khoản thành công.",
                    "totalImported", importedUsers.size(),
                    "role", targetRole.name()
            ));

        } catch (IllegalArgumentException e) {
            throw new AppException("Vai trò không hợp lệ: " + role + ". Vui lòng nhập LECTURER hoặc STUDENT.", HttpStatus.BAD_REQUEST);
        }
    }
}