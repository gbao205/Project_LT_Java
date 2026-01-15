package com.cosre.backend.controller;

import com.cosre.backend.dto.TaskRequest;
import com.cosre.backend.dto.StatusChangeRequest;
import com.cosre.backend.entity.Task;
import com.cosre.backend.service.TaskService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
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

    // Lấy tất cả Tasks của một Team
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<Task>> getTasksByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(taskService.getTasksByTeam(teamId));
    }

    // Lấy Task theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // Tạo Task mới
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest request) {
        // Gọi service để xử lý nghiệp vụ lưu trữ
        return ResponseEntity.ok(taskService.createTask(request));
    }

    // API chuyển đổi trạng thái Task (áp dụng FSM)
    @PutMapping("/{id}/status")
    public ResponseEntity<Task> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusChangeRequest request) {

        Task updatedTask = taskService.changeTaskStatus(id, request.getNewStatus());
        return ResponseEntity.ok(updatedTask);
    }

    // API Xóa nhiệm vụ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // gán task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody TaskRequest request) {
        // TaskRequest đã có sẵn các field title, description, assignedToId, milestoneId, dueDate
        Task updatedTask = taskService.updateTask(id, request);
        return ResponseEntity.ok(updatedTask);
    }
}