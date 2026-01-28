package com.cosre.backend.service;

import com.cosre.backend.dto.TaskRequest;
import com.cosre.backend.entity.*;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final TeamMemberRepository teamMemberRepository;
    private final TeamMilestoneStatusRepository milestoneStatusRepository;
    private final NotificationService notificationService;

    // Lấy User hiện tại an toàn (tránh NullPointer)
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Kiểm tra kỹ trước khi gọi getName()
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AppException("Người dùng chưa đăng nhập hoặc phiên làm việc hết hạn", HttpStatus.UNAUTHORIZED);
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.UNAUTHORIZED));
    }

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
        // 1. Kiểm tra Team tồn tại
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new AppException("Nhóm không tồn tại", HttpStatus.NOT_FOUND));

        // 2. Kiểm tra quyền thành viên
        User currentUser = getCurrentUser(); 
        boolean isMember = teamMemberRepository.existsByTeam_IdAndStudent_Id(request.getTeamId(), currentUser.getId());
        if (!isMember) {
            throw new AppException("Bạn không có quyền tạo công việc cho nhóm này", HttpStatus.FORBIDDEN);
        }

        // 3. Tìm các đối tượng liên quan nếu có ID gửi lên
        User assignedTo = (request.getAssignedToId() != null) ? 
            userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND)) : null;

        Milestone milestone = (request.getMilestoneId() != null) ? 
            milestoneRepository.findById(request.getMilestoneId())
                .orElseThrow(() -> new AppException("Cột mốc không tồn tại", HttpStatus.NOT_FOUND)) : null;

        // 4. Sử dụng Builder để tạo Task đồng bộ với style của dự án
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .status(TaskStatus.TO_DO)
                .team(team)
                .assignedTo(assignedTo)
                .milestone(milestone)
                .build();

        Task savedTask = taskRepository.save(task);  

        // GỬI THÔNG BÁO: Nếu gán cho người khác
        if (assignedTo != null && !assignedTo.getId().equals(currentUser.getId())) {
            notificationService.createAndSend(
                assignedTo,
                "Nhiệm vụ mới",
                currentUser.getFullName() + " đã gán nhiệm vụ '" + task.getTitle() + "' cho bạn.",
                NotificationType.TASK,
                "/student/workspace/" + team.getId() // Điều hướng về workspace của nhóm
            );
        }

        return savedTask;
    }

    // 4. Chuyển đổi trạng thái Task (áp dụng FSM)
    @Transactional
    public Task changeTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException("Không tìm thấy Task", HttpStatus.NOT_FOUND));

        if (task.getMilestone() != null) {
            // Tìm trạng thái của Milestone này đối với Team của Task
            milestoneStatusRepository.findByTeamIdAndMilestoneId(
                    task.getTeam().getId(), 
                    task.getMilestone().getId()
            ).ifPresent(status -> {
                if (status.isCompleted()) {
                    throw new AppException(
                        "Giai đoạn '" + task.getMilestone().getTitle() + "' đã kết thúc. Bạn không thể thay đổi trạng thái nhiệm vụ này!", 
                        HttpStatus.BAD_REQUEST
                    );
                }
            });
        }

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

    // 5. Xóa Task
    @Transactional
    public void deleteTask(Long id) {
        // Kiểm tra task có tồn tại không bằng Repository
        if (!taskRepository.existsById(id)) {
            throw new AppException("Không tìm thấy nhiệm vụ với ID: " + id, HttpStatus.NOT_FOUND);
        }
        
        try {
            // Thực hiện xóa khỏi PostgreSQL qua Hibernate
            taskRepository.deleteById(id);
        } catch (Exception e) {
            throw new AppException("Lỗi hệ thống khi xóa nhiệm vụ", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // gán lại task
    @Transactional
    public Task updateTask(Long taskId, TaskRequest request) {
        // 1. Tìm task hiện tại
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException("Nhiệm vụ không tồn tại", HttpStatus.NOT_FOUND));

        User currentUser = getCurrentUser();

        // 2. Xử lý gán người thực hiện (AssignedTo)
        if (request.getAssignedToId() != null) {
            User newAssignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new AppException("Thành viên không tồn tại", HttpStatus.NOT_FOUND));

            // Kiểm tra nếu thay đổi người phụ trách và không phải tự gán cho mình
            boolean isChanged = task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(newAssignee.getId());        

            // Kiểm tra người được gán có thuộc Team của Task này không
            boolean isMember = teamMemberRepository.existsByTeam_IdAndStudent_Id(
                    task.getTeam().getId(), 
                    newAssignee.getId()
            );
            
            if (!isMember) {
                throw new AppException("Thành viên này không thuộc nhóm của nhiệm vụ", HttpStatus.BAD_REQUEST);
            }
            task.setAssignedTo(newAssignee);

            if (isChanged && !newAssignee.getId().equals(currentUser.getId())) {
                notificationService.createAndSend(
                    newAssignee,
                    "Cập nhật nhiệm vụ",
                    currentUser.getFullName() + " đã gán bạn phụ trách nhiệm vụ: " + task.getTitle(),
                    NotificationType.TASK,
                    "/student/workspace/" + task.getTeam().getId()
                );
            }
        } else {
            // Nếu assignedToId là null thì gỡ bỏ người thực hiện (Unassigned)
            task.setAssignedTo(null);
        }

        // 3. Cập nhật các trường khác (nếu có gửi lên)
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        
        if (request.getMilestoneId() != null) {
            Milestone milestone = milestoneRepository.findById(request.getMilestoneId())
                    .orElseThrow(() -> new AppException("Cột mốc không tồn tại", HttpStatus.NOT_FOUND));
            task.setMilestone(milestone);
        }

        return taskRepository.save(task);
    }

    // lấy tổng task chưa hoàn thành
    public long countAllActiveTasksForStudent() {
        User currentUser = getCurrentUser();
        return taskRepository.countByAssignedToIdAndStatusNot(currentUser.getId(), TaskStatus.DONE);
    }
}