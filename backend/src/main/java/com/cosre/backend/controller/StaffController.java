package com.cosre.backend.controller;

import com.cosre.backend.dto.ClassRequest;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.service.ClassService;
import com.cosre.backend.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.cosre.backend.dto.staff.ClassResponseDTO;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService staffService;
    private final ClassService classService;

    @PostMapping("/import-user")
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
    @GetMapping("/search-user")
    public ResponseEntity<List<User>> getAllUserForStaff(@RequestParam(required = false) String search){
        return ResponseEntity.ok()
                .body(staffService.getAllUser(search));
    }

    @PostMapping("/import-classes")
    public ResponseEntity<?> importClasses(@RequestParam("file") MultipartFile  file) {
        List<ClassResponseDTO> result = staffService.importClassesFromFile(file);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/createclass")
    public ResponseEntity<?> createClass(@RequestBody ClassRequest request) {
        return ResponseEntity.ok(classService.createClass(request));
    }
    @GetMapping("/classes")
    public ResponseEntity<List<ClassResponseDTO>> getAllClasses() {
        return ResponseEntity.ok(staffService.getAllClassesForStaff());
    }
    @PatchMapping("/classes/{classId}/toggle-registration")
    public ResponseEntity<?> toggleRegistration(@PathVariable Long classId) {
        ClassResponseDTO updatedClass = staffService.toggleRegistrationStatus(classId);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thành công",
                "status", updatedClass.isRegistrationOpen()
        ));
    }
}