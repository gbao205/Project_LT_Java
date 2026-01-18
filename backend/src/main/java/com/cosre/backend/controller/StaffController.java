package com.cosre.backend.controller;

import com.cosre.backend.dto.staff.SubjectDTO;
import com.cosre.backend.dto.staff.SyllabusDetailDTO;
import com.cosre.backend.dto.staff.SyllabusListDTO;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.service.IStaffService;
import com.cosre.backend.service.import_system.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.cosre.backend.dto.staff.ClassResponseDTO;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    private final IimportParser<?> importUser;
    private final IimportParser<?> importSubject;
    private final IimportParser<?> importClass;
    private final IimportParser<?> importSyllabus;
    private final IStaffService staffService;
    @Autowired
    public StaffController(
            IStaffService staffService,
            @Qualifier("importUser") IimportParser<?> importUser,
            @Qualifier("importSubject") IimportParser<?> importSubject,
            @Qualifier("importClass") IimportParser<?> importClasses,
            @Qualifier("importSyllabus") IimportParser<?> importSyllabus
            ) {
        this.staffService = staffService;
        this.importUser = importUser;
        this.importSubject =importSubject;
        this.importClass=importClasses;
        this.importSyllabus=importSyllabus;
    }

    @GetMapping("/search-user")
    public ResponseEntity<List<User>> getAllUserForStaff(@RequestParam(required = false) String search){
        return ResponseEntity.ok()
                .body(staffService.getAllUser(search));
    }

    //===================================import================================================
    @PostMapping("/import-subject")
    public ResponseEntity<?> importSubject(@RequestParam("file") MultipartFile file) {
        importSubject.execute(file);
        return ResponseEntity.status(HttpStatus.OK)
                .body(Map.of("message", "Import môn học thành công!"));
    }
    @PostMapping("/import-syllabus")
    public ResponseEntity<?> importSyllabus(@RequestParam("file") MultipartFile file)
    {
        importSyllabus.execute(file);
        return ResponseEntity.status(HttpStatus.OK
        ).body(Map.of("message","import Syllabus thành công!"));
    }
    @PostMapping("/import-classes")
    public ResponseEntity<?> importClasses(@RequestParam("file") MultipartFile  file) {
        importClass.execute(file);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message","Import class thành công"));
    }
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
    //===================================Syllabus================================================
    @GetMapping("/syllabus")
    public ResponseEntity<Page<SyllabusListDTO>> getSyllabusList(
                                                                  @RequestParam(defaultValue="0") int page,
                                                                  @RequestParam(defaultValue="10") int size,
                                                                  @RequestParam(required = false) Long id,
                                                                  @RequestParam(required = false) String subjectName,
                                                                  @RequestParam(required = false) Integer year
    ) {
        Page<SyllabusListDTO> result = staffService.getSyllabusList(page, size, id, subjectName, year);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/syllabus/{id}")
    public SyllabusDetailDTO getSyllabusDetail(@PathVariable Long id){
        return staffService.getSyllabusDetail(id);
    }
    //===================================Subject================================================
    @GetMapping("/subject")
    public Page<SubjectDTO> getSubjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization
    ) {
        return staffService.getSubjects(
                page,
                size,
                subjectCode,
                name,
                specialization
        );
    }
    //===================================class================================================
    @GetMapping("/classes")
    public Page<ClassResponseDTO> getClasses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,

            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String classCode,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String subjectName,
            @RequestParam(required = false) String lecturerName,
            @RequestParam(required = false) Boolean isRegistrationOpen
    ) {
        return staffService.getClasses(
                page,
                size,
                id,
                classCode,
                name,
                semester,
                subjectName,
                lecturerName,
                isRegistrationOpen
        );
    }
    //===================================assign================================================
    @PutMapping("/classes/{classId}/assign-lecturer/{lecturerId}")
    public ResponseEntity<String> assignLecturer(
            @PathVariable Long classId,
            @PathVariable Long lecturerId) {
        staffService.assignLecturer(classId, lecturerId);
        return ResponseEntity.ok("Phân công giảng viên thành công");
    }
}