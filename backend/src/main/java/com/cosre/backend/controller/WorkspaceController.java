package com.cosre.backend.controller;

import com.cosre.backend.dto.CheckpointRequest;
import com.cosre.backend.dto.TeamMilestoneResponse;
import com.cosre.backend.entity.*;
import com.cosre.backend.service.WorkspaceService;
import com.cosre.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.cosre.backend.dto.MilestoneAnswerRequest;

import java.util.List;

@RestController
@RequestMapping("/api/workspace")
@RequiredArgsConstructor
public class WorkspaceController {
    private final WorkspaceService workspaceService;
    private final StudentService studentService;

    // Lấy Checkpoints
    @GetMapping("/teams/{teamId}/checkpoints")
    public ResponseEntity<List<Checkpoint>> getCheckpoints(@PathVariable Long teamId) {
        return ResponseEntity.ok(workspaceService.getCheckpointsByTeam(teamId));
    }

    @PostMapping("/teams/{teamId}/checkpoints")
    public ResponseEntity<Checkpoint> createCheckpoint(
            @PathVariable Long teamId,
            @RequestBody CheckpointRequest request) {
        
        User currentUser = studentService.getCurrentUser(); 
        
        return ResponseEntity.ok(workspaceService.createCheckpoint(teamId, request, currentUser));
    }

    // Thay đổi trạng thái Checkpoint
    @PutMapping("/checkpoints/{id}/toggle")
    public ResponseEntity<?> toggleCheckpoint(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceService.toggleCheckpoint(id));
    }

    @GetMapping("/teams/{teamId}/milestones")
    public ResponseEntity<List<TeamMilestoneResponse>> getMilestones(@PathVariable Long teamId) {
        return ResponseEntity.ok(workspaceService.getTeamMilestones(teamId));
    }

    // Nộp câu trả lời Milestone
    @PostMapping("/teams/{teamId}/milestones/{milestoneId}/answer")
    public ResponseEntity<?> submitAnswer(@PathVariable Long teamId, 
                                        @PathVariable Long milestoneId, 
                                        @RequestBody MilestoneAnswerRequest request) {
        workspaceService.submitMilestoneAnswer(teamId, milestoneId, request);
        return ResponseEntity.ok("Đã lưu câu trả lời");
    }

    @DeleteMapping("/checkpoints/{id}")
    public ResponseEntity<?> deleteCheckpoint(@PathVariable Long id) {
        workspaceService.deleteCheckpoint(id);
        return ResponseEntity.ok("Đã xóa checkpoint");
    }

    @GetMapping("/teams/{teamId}/resources")
    public ResponseEntity<List<TeamResource>> getResources(@PathVariable Long teamId) {
        return ResponseEntity.ok(workspaceService.getResourcesByTeam(teamId));
    }

    @PostMapping("/teams/{teamId}/resources")
    public ResponseEntity<TeamResource> uploadResource(
            @PathVariable Long teamId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        
        User currentUser = studentService.getCurrentUser();
        return ResponseEntity.ok(workspaceService.saveResource(teamId, file, currentUser));
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        User currentUser = studentService.getCurrentUser();
        workspaceService.deleteResource(id, currentUser);
        return ResponseEntity.ok("Đã xóa tài liệu");
    }
}