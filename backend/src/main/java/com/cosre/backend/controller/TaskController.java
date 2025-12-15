package com.cosre.backend.controller;

import com.cosre.backend.dto.TaskRequest;
import com.cosre.backend.dto.StatusChangeRequest;
import com.cosre.backend.entity.Task;
import com.cosre.backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    // 1. Lấy tất cả Tasks của một Team
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<Task>> getTasksByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(taskService.getTasksByTeam(teamId));
    }

    // 2. Lấy Task theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // 3. Tạo Task mới
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    // 4. API chuyển đổi trạng thái Task (áp dụng FSM)
    @PutMapping("/{id}/status")
    public ResponseEntity<Task> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusChangeRequest request) {

        Task updatedTask = taskService.changeTaskStatus(id, request.getNewStatus());
        return ResponseEntity.ok(updatedTask);
    }
}