package com.cosre.backend.service;

import com.cosre.backend.dto.TeamMilestoneResponse;
import com.cosre.backend.entity.*;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.*;
import com.cosre.backend.dto.CheckpointRequest;
import com.cosre.backend.dto.MilestoneAnswerRequest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final CheckpointRepository checkpointRepository;
    private final TeamMilestoneStatusRepository milestoneStatusRepository;
    private final TeamRepository teamRepository;
    private final MilestoneRepository milestoneRepository;
    private final TeamMilestoneStatusRepository statusRepository;
    private final UserRepository userRepository;
    private final TeamResourceRepository resourceRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TaskRepository taskRepository;
    private final String uploadDir = "uploads/"; // Thư mục lưu file trên server

    // --- Xử lý Checkpoints ---
    public List<Checkpoint> getCheckpointsByTeam(Long teamId) {
        return checkpointRepository.findByTeamId(teamId);
    }

    @Transactional
    public Checkpoint createCheckpoint(Long teamId, CheckpointRequest req, User creator) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException("Team không tồn tại", HttpStatus.NOT_FOUND));

        Checkpoint cp = Checkpoint.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .dueDate(req.getDueDate())
                .team(team)
                .createdBy(creator)
                .isDone(false)
                .build();

        // Gán người phụ trách nếu có
        if (req.getAssignedToId() != null) {
            User assignee = userRepository.findById(req.getAssignedToId())
                    .orElseThrow(() -> new AppException("Người phụ trách không tồn tại", HttpStatus.NOT_FOUND));
            cp.setAssignedTo(assignee);
        }

        return checkpointRepository.save(cp);
    }

    @Transactional
    public Checkpoint toggleCheckpoint(Long id) {
        Checkpoint cp = checkpointRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy checkpoint", HttpStatus.NOT_FOUND));
        cp.setDone(!cp.isDone());
        return checkpointRepository.save(cp);
    }

    @Transactional
    public void deleteCheckpoint(Long id) {
        if (!checkpointRepository.existsById(id)) {
            throw new AppException("Checkpoint không tồn tại", HttpStatus.NOT_FOUND);
        }
        checkpointRepository.deleteById(id);
    }

    // --- Xử lý Milestone Nhóm ---
    @Transactional
    public void submitMilestoneAnswer(Long teamId, Long milestoneId, MilestoneAnswerRequest req) {
        TeamMilestoneStatus status = milestoneStatusRepository
                .findByTeamIdAndMilestoneId(teamId, milestoneId)
                .orElse(TeamMilestoneStatus.builder()
                        .team(teamRepository.getReferenceById(teamId))
                        .milestone(milestoneRepository.getReferenceById(milestoneId))
                        .build());
        
        if (status.isCompleted()) {
            throw new AppException("Giai đoạn này đã khóa, không thể chỉnh sửa.", HttpStatus.BAD_REQUEST);
        }

        status.setAnswer(req.getAnswer());
        status.setCompletedTaskIds(req.getTaskIds());
        milestoneStatusRepository.save(status);
    }

    @Transactional
    public void markMilestoneAsComplete(Long teamId, Long milestoneId) {
        TeamMilestoneStatus status = milestoneStatusRepository
                .findByTeamIdAndMilestoneId(teamId, milestoneId)
                .orElseThrow(() -> new AppException("Vui lòng nhập câu trả lời trước khi hoàn thành", HttpStatus.BAD_REQUEST));
        
        status.setCompleted(true);
        status.setCompletedAt(LocalDateTime.now());
        milestoneStatusRepository.save(status);
    }

    // 
    public List<TeamMilestoneResponse> getTeamMilestones(Long teamId) {
        // 1. Tìm nhóm và lớp học liên quan
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException("Nhóm không tồn tại", HttpStatus.NOT_FOUND));
        
        Long classId = team.getClassRoom().getId();

        // 2. Lấy tất cả cột mốc của lớp học
        List<Milestone> allMilestones = milestoneRepository.findByClassRoom_Id(classId);

        // 3. Lấy tất cả trạng thái hiện tại của nhóm này
        List<TeamMilestoneStatus> statuses = statusRepository.findByTeamId(teamId);

        // 4. Ánh xạ và kết hợp dữ liệu
        return allMilestones.stream().map(m -> {
            // Tìm bản ghi trạng thái tương ứng với milestone này
            TeamMilestoneStatus status = statuses.stream()
                    .filter(s -> s.getMilestone().getId().equals(m.getId()))
                    .findFirst()
                    .orElse(null);

            return TeamMilestoneResponse.builder()
                    .id(m.getId())
                    .title(m.getTitle())
                    .description(m.getDescription())
                    .dueDate(m.getDueDate())
                    .completed(status != null && status.isCompleted())
                    .answer(status != null ? status.getAnswer() : "")
                    .feedback(status != null ? status.getFeedback() : null)
                    .completedTaskIds(status != null ? status.getCompletedTaskIds() : null)
                    .completedAt(status != null ? status.getCompletedAt() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<TeamResource> getResourcesByTeam(Long teamId) {
        return resourceRepository.findByTeamId(teamId);
    }

    @Transactional
    public TeamResource saveResource(Long teamId, MultipartFile file, User user) {
        // 1. KIỂM TRA BẢO MẬT: Phải là thành viên nhóm mới được upload
        boolean isMember = teamMemberRepository.existsByTeam_IdAndStudent_Id(teamId, user.getId());
        
        if (!isMember) {
            throw new AppException("Bạn không có quyền tải tài liệu lên không gian của nhóm này!", HttpStatus.FORBIDDEN);
        }

        // 2. Sau khi đã xác minh quyền, mới tiến hành tìm Team và xử lý File
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException("Team không tồn tại", HttpStatus.NOT_FOUND));

        try {
            // Kiểm tra dung lượng hoặc loại file nếu cần (ví dụ chỉ cho phép < 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new AppException("Kích thước file quá lớn (Tối đa 10MB)", HttpStatus.BAD_REQUEST);
            }

            // Thực hiện lưu file vật lý...
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path path = java.nio.file.Paths.get(uploadDir + fileName);
            java.nio.file.Files.createDirectories(path.getParent());
            java.nio.file.Files.write(path, file.getBytes());

            // Lưu Database
            TeamResource resource = TeamResource.builder()
                    .title(file.getOriginalFilename())
                    .fileUrl("/api/workspace/download/" + fileName)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadDate(LocalDateTime.now())
                    .team(team)
                    .uploadedBy(user)
                    .build();

            return resourceRepository.save(resource);
        } catch (java.io.IOException e) {
            throw new AppException("Lỗi hệ thống khi lưu tệp tin", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void deletePhysicalFile(String fileUrl) {
        try {
            // fileUrl thường có dạng: /api/workspace/download/1736854921_file.pdf
            // Chúng ta cần lấy ra tên file: 1736854921_file.pdf
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            
            // Đường dẫn thực tế trên server
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads/" + fileName);
            
            // Thực hiện xóa
            java.nio.file.Files.deleteIfExists(filePath);
            System.out.println("Đã xóa file vật lý: " + fileName);
        } catch (Exception e) {
            // Chỉ log lỗi chứ không nên chặn quy trình xóa DB nếu xóa file vật lý thất bại
            System.err.println("Không thể xóa file vật lý: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteResource(Long resourceId, User currentUser) {
        TeamResource res = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new AppException("File không tồn tại", HttpStatus.NOT_FOUND));

        // Kiểm tra quyền: Phải là người upload HOẶC là Leader của nhóm đó
        boolean isUploader = res.getUploadedBy().getId().equals(currentUser.getId());
        
        // Tìm role của user trong team
        TeamMember member = teamMemberRepository.findByTeam_IdAndStudent_Id(res.getTeam().getId(), currentUser.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy thành viên", HttpStatus.FORBIDDEN));
        
        boolean isLeader = "LEADER".equals(member.getRole().name());

        if (!isUploader && !isLeader) {
            throw new AppException("Bạn không có quyền xóa file này", HttpStatus.FORBIDDEN);
        }

        // Xóa file vật lý trước khi xóa bản ghi DB (tùy chọn)
        deletePhysicalFile(res.getFileUrl()); 

        resourceRepository.delete(res);
    }
}