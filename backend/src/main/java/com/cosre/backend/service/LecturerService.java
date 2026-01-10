package com.cosre.backend.service;

import com.cosre.backend.dto.DashboardStats;
import com.cosre.backend.dto.lecturer.ClassProposalDTO;
import com.cosre.backend.dto.lecturer.ProposalDTO;
import com.cosre.backend.entity.*;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.ProjectRepository;
import com.cosre.backend.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LecturerService {

    @Autowired
    private ClassRoomRepository classRoomRepository;

    @Autowired
    private TeamRepository teamRepository; // Cần có Repository này

    @Autowired
    private ProjectRepository projectRepository;

    // 1. Lấy danh sách lớp của giảng viên
    public List<ClassRoom> getMyClasses(String email) {
        return classRoomRepository.findByLecturerEmail(email);
    }

    // 2. Lấy thống kê Dashboard (Dữ liệu thật)
    public DashboardStats getLecturerStats(String email) {
        // Lấy danh sách lớp
        List<ClassRoom> classes = classRoomRepository.findByLecturerEmail(email);
        long activeClasses = classes.size();

        // Tính tổng sinh viên và số đề tài đang chờ duyệt (PENDING)
        long totalStudents = 0;
        long pendingRequests = 0;

        for (ClassRoom cls : classes) {
            // Đếm sinh viên
            totalStudents += cls.getStudents().size();

            // Đếm đề tài PENDING trong các nhóm thuộc lớp này
            List<Team> teams = teamRepository.findByClassRoom_Id(cls.getId());
            for (Team team : teams) {
                if (team.getProject() != null && team.getProject().getStatus() == ProjectStatus.PENDING) {
                    pendingRequests++;
                }
            }
        }

        return new DashboardStats(
                0L, 0L, // user count (admin only)
                activeClasses,
                0L, // subject count
                0L, // project count
                pendingRequests,
                totalStudents
        );
    }

    // 3. Lấy danh sách đề tài để duyệt (Cấu trúc phân cấp theo Lớp)
    public List<ClassProposalDTO> getProposalsByLecturer(String email) {
        List<ClassRoom> classes = classRoomRepository.findByLecturerEmail(email);
        List<ClassProposalDTO> result = new ArrayList<>();

        for (ClassRoom cls : classes) {
            // Lấy tất cả nhóm trong lớp này
            List<Team> teams = teamRepository.findByClassRoom_Id(cls.getId());
            List<ProposalDTO> proposalDTOS = new ArrayList<>();
            int pendingCount = 0;

            for (Team team : teams) {
                Project project = team.getProject();

                // Chỉ lấy những nhóm đã đăng ký đề tài
                if (project != null) {
                    // Mapping thông tin thành viên: "Tên (MSSV)"
                    List<String> studentNames = team.getMembers().stream()
                            .map(m -> m.getStudent().getFullName() + " (" + m.getStudent().getCode() + ")")
                            .collect(Collectors.toList());

                    // Mapping sang DTO
                    ProposalDTO dto = ProposalDTO.builder()
                            .id(project.getId()) // ID của Project để approve/reject
                            .groupName(team.getTeamName())
                            .students(studentNames)
                            .title(project.getName())
                            .titleEn("") // Nếu entity Project chưa có thì để trống hoặc update Entity sau
                            .description(project.getDescription())
                            .technology("") // Tương tự, nếu Project chưa có field này
                            .status(project.getStatus().name()) // PENDING, APPROVED, REJECTED
                            .submittedDate("2024-01-01") // Cần thêm field created_at vào Project nếu muốn chính xác
                            .build();

                    proposalDTOS.add(dto);

                    if (project.getStatus() == ProjectStatus.PENDING) {
                        pendingCount++;
                    }
                }
            }

            // Chỉ thêm lớp vào danh sách nếu lớp đó có nhóm/đề tài
            // Hoặc hiển thị hết tùy nhu cầu (ở đây tôi hiển thị hết để giảng viên thấy lớp trống)
            ClassProposalDTO classDto = ClassProposalDTO.builder()
                    .id(cls.getId())
                    .name(cls.getName()) // Ví dụ: SE1701
                    .semester(cls.getSemester())
                    .pendingCount(pendingCount)
                    .proposals(proposalDTOS)
                    .build();

            result.add(classDto);
        }

        return result;
    }

    // 4. Cập nhật trạng thái đề tài (Duyệt / Từ chối)
    public void updateProjectStatus(Long projectId, String status, String reason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài với ID: " + projectId));

        if ("APPROVED".equalsIgnoreCase(status)) {
            project.setStatus(ProjectStatus.APPROVED);
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            project.setStatus(ProjectStatus.REJECTED);
            // TODO: Nếu muốn lưu lý do từ chối, cần thêm trường 'rejectReason' vào Entity Project
            // project.setRejectReason(reason);
        } else {
            throw new RuntimeException("Trạng thái không hợp lệ");
        }

        projectRepository.save(project);
    }
}