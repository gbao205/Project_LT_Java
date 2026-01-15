package com.cosre.backend.controller;

import com.cosre.backend.dto.staff.ClassResponseDTO;
import com.cosre.backend.dto.student.*;
import com.cosre.backend.entity.Student;
import com.cosre.backend.entity.Team;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // Lấy thông tin hồ sơ cá nhân
    @GetMapping("/profile")
    public ResponseEntity<Student> getProfile() {
        return ResponseEntity.ok(studentService.getMyProfile());
    }

    // Cập nhật hồ sơ cá nhân
    @PutMapping("/profile")
    public ResponseEntity<Student> updateProfile(@RequestBody Student studentRequest) {
        return ResponseEntity.ok(studentService.updateProfile(studentRequest));
    }

    // Tạo nhóm (Không cần lấy email ở đây nữa)
    @PostMapping("/teams/create")
    public ResponseEntity<?> createTeam(@RequestBody CreateTeamRequest request) {
        return ResponseEntity.ok(studentService.createTeam(request));
    }

    // Tham gia nhóm
    @PostMapping("/teams/join-team-by-code")
    public ResponseEntity<?> joinTeam(@RequestBody JoinTeamRequest request) {
        studentService.joinTeam(request);
        return ResponseEntity.ok("Tham gia nhóm thành công!");
    }

    // API Rời nhóm (Sửa lỗi No static resource)
    @PostMapping("/teams/leave")
    public ResponseEntity<?> leaveTeam(@RequestBody Map<String, Long> request) {
        Long teamId = request.get("teamId");
        if (teamId == null) {
            throw new AppException("Team ID là bắt buộc", HttpStatus.BAD_REQUEST);
        }
        studentService.leaveTeam(teamId);
        return ResponseEntity.ok(Map.of("message", "Rời nhóm thành công!"));
    }

    // Chuyển quyền Leader cho thành viên khác
    @PostMapping("/teams/assign-leader")
    public ResponseEntity<?> assignLeader(@RequestBody Map<String, Long> request) {
        Long teamId = request.get("teamId");
        Long newLeaderId = request.get("newLeaderId"); // ID của TeamMember, không phải User ID
        studentService.assignLeader(teamId, newLeaderId);
        return ResponseEntity.ok(Map.of("message", "Chuyển quyền trưởng nhóm thành công!"));
    }

    // Lấy nhóm của tôi
    @GetMapping("/classes/{classId}/my-team")
    public ResponseEntity<?> getMyTeam(@PathVariable Long classId) {
        Team team = studentService.getMyTeam(classId);
        return ResponseEntity.ok(team != null ? team : Map.of("message", "Chưa có nhóm"));
    }

    // Lấy danh sách nhóm trong lớp
    @GetMapping("/classes/{classId}/teams")
    public ResponseEntity<?> getClassTeams(@PathVariable Long classId) {
        return ResponseEntity.ok(studentService.getAvailableTeams(classId));
    }

    // Đăng ký đề tài
    @PostMapping("/project/register")
    public ResponseEntity<Team> registerProject(@RequestBody ProjectRegistrationRequest request) {
        return ResponseEntity.ok(studentService.registerProject(request));
    }

    // Lấy danh sách tất cả nhóm đã tham gia
    @GetMapping("/my-teams")
    public ResponseEntity<List<Team>> getAllJoinedTeams() {
        return ResponseEntity.ok(studentService.getAllJoinedTeams());
    }

    // Xem milestone
    @GetMapping("/classes/{classId}/milestones")
    public ResponseEntity<?> getMilestones(@PathVariable Long classId) {
        return ResponseEntity.ok(studentService.getClassMilestones(classId));
    }

    // API Lấy danh sách sinh viên chưa có nhóm trong lớp
    @GetMapping("/classes/{classId}/students-no-team")
    public ResponseEntity<?> getStudentsNoTeam(@PathVariable Long classId) {
        return ResponseEntity.ok(studentService.getStudentsWithoutTeam(classId));
    }

    // Lấy danh sách lớp chưa có nhóm
    @GetMapping("/classes/no-team")
    public ResponseEntity<List<ClassResponseDTO>> getClassesAvailableForTeam() {
        return ResponseEntity.ok(studentService.getClassesAvailableForTeam());
    }

    // lấy thông tin chi tiết của một nhóm duy nhất bằng ID
    @GetMapping("/teams/{teamId}")
    public ResponseEntity<Team> getTeamDetail(@PathVariable Long teamId) {
        // Logic: Tìm team theo ID và kiểm tra xem sinh viên hiện tại có thuộc team đó không
        return ResponseEntity.ok(studentService.getTeamById(teamId));
    }
}