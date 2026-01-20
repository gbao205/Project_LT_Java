package com.cosre.backend.service;

import com.cosre.backend.dto.head.HeadDashboardStats;
import com.cosre.backend.dto.head.HeadLecturerDTO;
import com.cosre.backend.dto.head.HeadProjectDTO;
import com.cosre.backend.dto.head.LecturerSubmissionDTO;
import com.cosre.backend.entity.Project;
import com.cosre.backend.entity.ProjectStatus;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.ProjectRepository;
import com.cosre.backend.repository.UserRepository;
import com.cosre.backend.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeadService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;

    public List<LecturerSubmissionDTO> getProposalsGroupedByLecturer() {
        List<Project> allProjects = projectRepository.findAll();
        Map<Long, List<Project>> projectsMap = new HashMap<>();

        for (Project p : allProjects) {
            Long ownerId = -1L;
            if (p.getOwner() != null && p.getOwner().getId() != null) {
                ownerId = p.getOwner().getId();
            }
            projectsMap.computeIfAbsent(ownerId, k -> new ArrayList<>()).add(p);
        }

        List<LecturerSubmissionDTO> result = new ArrayList<>();

        for (Map.Entry<Long, List<Project>> entry : projectsMap.entrySet()) {
            Long ownerId = entry.getKey();
            List<Project> projects = entry.getValue();

            String lecturerName = "⚠️ Giảng viên không xác định";
            String email = "N/A";

            if (ownerId != -1L && !projects.isEmpty()) {
                User owner = projects.get(0).getOwner();
                if (owner != null) {
                    lecturerName = owner.getFullName() != null ? owner.getFullName() : "No Name";
                    email = owner.getEmail() != null ? owner.getEmail() : "No Email";
                }
            }

            List<HeadProjectDTO> projectDTOs = projects.stream().map(p -> {
                String statusStr = (p.getStatus() != null) ? p.getStatus().name() : "PENDING";
                String techStr = (p.getTechnology() != null) ? p.getTechnology() : "Chưa cập nhật";
                int maxStu = (p.getMaxStudents() != null) ? p.getMaxStudents() : 0;
                LocalDate subDate = p.getSubmittedDate();

                // Lấy tên Reviewer
                String reviewerName = (p.getReviewer() != null) ? p.getReviewer().getFullName() : "Chưa phân công";

                return HeadProjectDTO.builder()
                        .id(p.getId())
                        .title(p.getName())
                        .description(p.getDescription())
                        .technology(techStr)
                        .maxStudents(maxStu)
                        .submittedDate(subDate)
                        .status(statusStr)
                        .reviewerName(reviewerName) // Gửi về frontend
                        .reviewScore(p.getReviewScore())
                        .reviewComment(p.getReviewComment())
                        .build();
            }).collect(Collectors.toList());

            int pendingCount = (int) projects.stream()
                    .filter(p -> p.getStatus() == ProjectStatus.PENDING).count();

            result.add(LecturerSubmissionDTO.builder()
                    .lecturerId(ownerId)
                    .lecturerName(lecturerName)
                    .email(email)
                    .pendingCount(pendingCount)
                    .proposals(projectDTOs)
                    .build());
        }
        return result;
    }

    @Transactional
    public void assignReviewer(Long projectId, Long reviewerId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException("Không tìm thấy đề tài", HttpStatus.NOT_FOUND));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new AppException("Giảng viên không tồn tại", HttpStatus.NOT_FOUND));

        // Logic nghiệp vụ: Người hướng dẫn không được làm người phản biện
        if (project.getOwner() != null && project.getOwner().getId().equals(reviewerId)) {
            throw new AppException("GV hướng dẫn không thể tự phản biện chính mình!", HttpStatus.BAD_REQUEST);
        }

        project.setReviewer(reviewer);
        projectRepository.save(project);
    }

    @Transactional
    public void approveProposal(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException("Không tìm thấy đề tài", HttpStatus.NOT_FOUND));
        project.setStatus(ProjectStatus.APPROVED);
        project.setRejectionReason(null);
        projectRepository.save(project);
    }

    @Transactional
    public void rejectProposal(Long projectId, String reason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException("Không tìm thấy đề tài", HttpStatus.NOT_FOUND));
        project.setStatus(ProjectStatus.REJECTED);
        project.setRejectionReason(reason);
        projectRepository.save(project);
    }

    public List<HeadLecturerDTO> getAllLecturers() {
        List<User> lecturers = userRepository.findByRole(Role.LECTURER);
        return lecturers.stream().map(lec -> {
            int proposalCount = projectRepository.countByOwner(lec);
            int classCount = classRoomRepository.countByLecturer(lec);
            boolean isActive = lec.getActive() != null && lec.getActive();

            return HeadLecturerDTO.builder()
                    .id(lec.getId())
                    .fullName(lec.getFullName())
                    .email(lec.getEmail())
                    .activeClassCount(classCount)
                    .proposalCount(proposalCount)
                    .status(isActive ? "ACTIVE" : "INACTIVE")
                    .build();
        }).collect(Collectors.toList());
    }

    public HeadDashboardStats getDashboardStats() {
        long pendingCount = projectRepository.countByStatus(ProjectStatus.PENDING);
        long lecturerCount = userRepository.countByRole(Role.LECTURER);
        return HeadDashboardStats.builder()
                .pendingProposals(pendingCount)
                .totalLecturers(lecturerCount)
                .build();
    }
}