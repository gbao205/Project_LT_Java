package com.cosre.backend.controller;

import com.cosre.backend.dto.student.*;
import com.cosre.backend.entity.Team;
import com.cosre.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // Tạo nhóm
    @PostMapping("/teams")
    public ResponseEntity<Team> createTeam(@RequestBody CreateTeamRequest request) {
        return ResponseEntity.ok(studentService.createTeam(request));
    }

    // Tham gia nhóm
    @PostMapping("/teams/{teamId}/join")
    public ResponseEntity<Void> joinTeam(@PathVariable Long teamId) {
        studentService.joinTeam(teamId);
        return ResponseEntity.ok().build();
    }

    // Đăng ký đề tài
    @PostMapping("/project/register")
    public ResponseEntity<Team> registerProject(@RequestBody ProjectRegistrationRequest request) {
        return ResponseEntity.ok(studentService.registerProject(request));
    }

    // Xem các mốc thời gian (Milestone)
    @GetMapping("/classes/{classId}/milestones")
    public ResponseEntity<?> getMilestones(@PathVariable Long classId) {
        return ResponseEntity.ok(studentService.getClassMilestones(classId));
    }
}