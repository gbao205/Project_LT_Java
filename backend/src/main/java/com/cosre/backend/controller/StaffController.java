package com.cosre.backend.controller;

import com.cosre.backend.dto.ClassRequest;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.Subject;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.service.ClassService;
import com.cosre.backend.service.StaffService;
import com.cosre.backend.service.SubjectService;
import com.cosre.backend.service.import_system.ImportSubject;
import com.cosre.backend.service.import_system.ImportSyllabus;
import com.cosre.backend.service.import_system.ImportUser;
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
    private final SubjectService subjectService;
    private final ImportUser importUser;
    private final ImportSubject importSubject;
    private final ImportSyllabus importSyllabus;
    @PostMapping("/import-user")
    public ResponseEntity<?> importUsers(
            @RequestParam("file") MultipartFile file,
            @RequestParam("role") String role,
            @RequestParam(value = "admissionDate", required = false) String admissionDate)
    {

        Role targetRole;
        try {
            targetRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Role không hợp lệ. Chỉ chấp nhận STUDENT hoặc LECTURER");
        }

        if (targetRole != Role.STUDENT && targetRole != Role.LECTURER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không hỗ trợ import cho Role này");
        }

        importUser.execute(file, targetRole,admissionDate);

        return ResponseEntity.ok(Map.of(
                "message", "Import danh sách " + targetRole + " thành công!"
        ));
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
    @PutMapping("/subjects/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.updateSubject(id, subject));
    }
    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/import-subject")
    public ResponseEntity<?> importSubject(@RequestParam("file") MultipartFile file) {
        importSubject.execute(file);
        return ResponseEntity.status(HttpStatus.OK)
                .body(Map.of("message", "Import môn học thành công!"));
    }
    @PostMapping("/import-syllabus")
    public ResponseEntity<?> importsyllabus(@RequestParam("file") MultipartFile file)
    {
        importSyllabus.execute(file);
        return ResponseEntity.status(HttpStatus.OK
        ).body(Map.of("message","import Syllabus thành công!"));
    }

}