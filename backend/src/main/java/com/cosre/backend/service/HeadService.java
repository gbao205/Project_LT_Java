package com.cosre.backend.service;

import com.cosre.backend.dto.head.HeadDashboardStats; // [MỚI] Import DTO
import com.cosre.backend.dto.head.HeadLecturerDTO;
import com.cosre.backend.dto.head.HeadProjectDTO;
import com.cosre.backend.dto.head.LecturerSubmissionDTO;
import com.cosre.backend.entity.Project;
import com.cosre.backend.entity.ProjectStatus;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.ClassRoomRepository; // [MỚI] Import Repo
import com.cosre.backend.repository.ProjectRepository;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeadService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository; // [MỚI] Inject thêm để đếm lớp

    // --- LOGIC CŨ (Duyệt đề tài) ---
    public List<LecturerSubmissionDTO> getProposalsGroupedByLecturer() {
        List<Project> allProjects = projectRepository.findAll();
        Map<User, List<Project>> projectsByLecturer = allProjects.stream()
                .filter(p -> p.getOwner() != null)
                .collect(Collectors.groupingBy(Project::getOwner));

        List<LecturerSubmissionDTO> result = new ArrayList<>();
        for (Map.Entry<User, List<Project>> entry : projectsByLecturer.entrySet()) {
            User lecturer = entry.getKey();
            List<Project> projects = entry.getValue();

            List<HeadProjectDTO> projectDTOs = projects.stream().map(p -> HeadProjectDTO.builder()
                    .id(p.getId())
                    .title(p.getName())
                    .description(p.getDescription())
                    .technology(p.getTechnology())
                    .maxStudents(p.getMaxStudents())
                    .submittedDate(p.getSubmittedDate())
                    .status(p.getStatus().name())
                    .build()).collect(Collectors.toList());

            int pendingCount = (int) projects.stream()
                    .filter(p -> p.getStatus() == ProjectStatus.PENDING).count();

            result.add(LecturerSubmissionDTO.builder()
                    .lecturerId(lecturer.getId())
                    .lecturerName(lecturer.getFullName())
                    .email(lecturer.getEmail())
                    .pendingCount(pendingCount)
                    .proposals(projectDTOs)
                    .build());
        }
        return result;
    }

    @Transactional
    public void approveProposal(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài"));
        project.setStatus(ProjectStatus.APPROVED);
        project.setRejectionReason(null);
        projectRepository.save(project);
    }

    @Transactional
    public void rejectProposal(Long projectId, String reason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài"));
        project.setStatus(ProjectStatus.REJECTED);
        project.setRejectionReason(reason);
        projectRepository.save(project);
    }

    // --- [SỬA LẠI] Logic Quản lý Giảng viên ---
    public List<HeadLecturerDTO> getAllLecturers() {
        // 1. Lấy user có role LECTURER
        List<User> lecturers = userRepository.findByRole(Role.LECTURER);

        return lecturers.stream().map(lec -> {
            // 2. Đếm số đề tài
            int proposalCount = projectRepository.countByOwner(lec);

            // 3. Đếm số lớp (Dùng hàm mới từ ClassRoomRepository để có dữ liệu thật)
            int classCount = classRoomRepository.countByLecturer(lec);

            // 4. Mapping Status
            String statusStr = (lec.getActive() != null && lec.getActive()) ? "ACTIVE" : "INACTIVE";

            return HeadLecturerDTO.builder()
                    .id(lec.getId())
                    .fullName(lec.getFullName())
                    .email(lec.getEmail())
                    .activeClassCount(classCount)
                    .proposalCount(proposalCount)
                    .status(statusStr)
                    .build();
        }).collect(Collectors.toList());
    }

    // --- [MỚI] Lấy thống kê cho Dashboard của Head ---
    public HeadDashboardStats getDashboardStats() {
        long pendingCount = projectRepository.countByStatus(ProjectStatus.PENDING);
        long lecturerCount = userRepository.countByRole(Role.LECTURER);

        return HeadDashboardStats.builder()
                .pendingProposals(pendingCount)
                .totalLecturers(lecturerCount)
                .build();
    }
}