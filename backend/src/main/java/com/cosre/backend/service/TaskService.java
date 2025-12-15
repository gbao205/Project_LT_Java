package com.cosre.backend.service;

import com.cosre.backend.dto.TaskRequest;
import com.cosre.backend.entity.*;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TeamRepository teamRepository;
    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;

    // Định nghĩa Finite State Machine (FSM) cho chuyển đổi trạng thái Task
    // Map: CurrentStatus -> Set<ValidNextStatuses>
    private static final Map<TaskStatus, Set<TaskStatus>> VALID_TRANSITIONS = Map.of(
            TaskStatus.TO_DO, Set.of(TaskStatus.IN_PROGRESS, TaskStatus.CANCELED),
            TaskStatus.IN_PROGRESS, Set.of(TaskStatus.REVIEW, TaskStatus.TO_DO, TaskStatus.CANCELED),
            TaskStatus.REVIEW, Set.of(TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.CANCELED),
            TaskStatus.DONE, Set.of(TaskStatus.CANCELED), // Task DONE thường chỉ có thể hủy/tái mở (reopen)
            TaskStatus.CANCELED, Set.of(TaskStatus.TO_DO) // Có thể reopen về TO_DO
    );

    // 1. Lấy tất cả Tasks theo Team
    public List<Task> getTasksByTeam(Long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new AppException("Không tìm thấy Team với ID: " + teamId, HttpStatus.NOT_FOUND);
        }
        return taskRepository.findByTeamId(teamId);
    }

    // 2. Lấy Task theo ID
    public Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException("Không tìm thấy Task với ID: " + taskId, HttpStatus.NOT_FOUND));
    }

    // 3. Tạo Task mới
    @Transactional
    public Task createTask(TaskRequest request) {
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new AppException("Team không tồn tại", HttpStatus.NOT_FOUND));

        Milestone milestone = null;
        if (request.getMilestoneId() != null) {
            milestone = milestoneRepository.findById(request.getMilestoneId())
                    .orElseThrow(() -> new AppException("Milestone không tồn tại", HttpStatus.NOT_FOUND));
        }

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new AppException("Người được giao không tồn tại", HttpStatus.NOT_FOUND));
        }

        Task newTask = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .team(team)
                .milestone(milestone)
                .assignedTo(assignedTo)
                .dueDate(request.getDueDate())
                .status(TaskStatus.TO_DO) // Mặc định là TO_DO
                .build();

        return taskRepository.save(newTask);
    }

    // 4. Chuyển đổi trạng thái Task (áp dụng FSM)
    @Transactional
    public Task changeTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException("Không tìm thấy Task", HttpStatus.NOT_FOUND));

        TaskStatus currentStatus = task.getStatus();

        // Ứng dụng FSM: Kiểm tra xem trạng thái mới có hợp lệ từ trạng thái hiện tại không
        Set<TaskStatus> allowedStatuses = VALID_TRANSITIONS.get(currentStatus);

        if (allowedStatuses == null || !allowedStatuses.contains(newStatus)) {
            throw new AppException(
                    String.format("Không thể chuyển từ trạng thái '%s' sang trạng thái '%s'!", currentStatus, newStatus),
                    HttpStatus.BAD_REQUEST
            );
        }

        // Thực hiện chuyển đổi trạng thái
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }
}