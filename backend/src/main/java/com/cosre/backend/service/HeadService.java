package com.cosre.backend.service;

import com.cosre.backend.dto.head.HeadDashboardStats;
import com.cosre.backend.dto.head.HeadLecturerDTO;
import com.cosre.backend.dto.head.HeadProjectDTO;
import com.cosre.backend.dto.head.LecturerSubmissionDTO;
import com.cosre.backend.dto.staff.ClassResponseDTO;
import com.cosre.backend.dto.staff.SubjectDTO;
import com.cosre.backend.dto.staff.SyllabusListDTO;
import com.cosre.backend.dto.staff.TimeTableResponseDTO;
import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.Project;
import com.cosre.backend.entity.ProjectStatus;
import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.repository.*;
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

    // Repository để lấy dữ liệu Môn học và Đề cương
    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;

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

                // Lấy tên người phản biện (Reviewer)
                String reviewerName = (p.getReviewer() != null) ? p.getReviewer().getFullName() : null;
                Long reviewerId = (p.getReviewer() != null) ? p.getReviewer().getId() : null;

                // Giả định entity Project đã có các trường này (theo yêu cầu trước đó)
                Double instructorScore = p.getInstructorScore();
                Double reviewScore = p.getReviewScore();
                Double councilScore = p.getCouncilScore();

                return HeadProjectDTO.builder()
                        .id(p.getId())
                        .title(p.getName())
                        .description(p.getDescription())
                        .technology(techStr)
                        .maxStudents(maxStu)
                        .submittedDate(subDate)
                        .status(statusStr)
                        .reviewerId(reviewerId)     // ID để check logic frontend
                        .reviewerName(reviewerName) // Tên để hiển thị
                        .reviewScore(reviewScore)   // Điểm phản biện
                        .instructorScore(instructorScore) // Điểm GVHD
                        .councilScore(councilScore)       // Điểm hội đồng
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

    // [CẬP NHẬT] Hàm lấy thống kê cho Dashboard
    public HeadDashboardStats getDashboardStats() {
        long pendingCount = projectRepository.countByStatus(ProjectStatus.PENDING);
        long lecturerCount = userRepository.countByRole(Role.LECTURER);

        // --- SỬA LOGIC ĐẾM LỚP ---
        // Lấy tất cả lớp và lọc những lớp ĐANG MỞ (isRegistrationOpen == true)
        long classCount = classRoomRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.isRegistrationOpen())) // Sử dụng getter đúng của boolean
                .count();

        long subjectCount = subjectRepository.count();
        long syllabusCount = syllabusRepository.count();

        return HeadDashboardStats.builder()
                .pendingProposals(pendingCount)
                .totalLecturers(lecturerCount)
                .totalClasses(classCount)   // Số lớp đang mở
                .totalSubjects(subjectCount)
                .totalSyllabi(syllabusCount)
                .build();
    }

    public List<ClassResponseDTO> getAllClasses() {
        List<ClassRoom> classes = classRoomRepository.findAll();
        return classes.stream().map(c -> ClassResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .classCode(c.getClassCode())
                .semester(c.getSemester())
                .subjectName(c.getSubject() != null ? c.getSubject().getName() : "N/A")
                .lecturerName(c.getLecturer() != null ? c.getLecturer().getFullName() : "Chưa phân công")
                .isRegistrationOpen(c.isRegistrationOpen())
                .studentCount(c.getStudents() != null ? c.getStudents().size() : 0)
                .maxCapacity(c.getMaxCapacity() != null ? c.getMaxCapacity() : 0)
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .timeTables(c.getTimeTables() != null ? c.getTimeTables().stream().map(t -> TimeTableResponseDTO.builder()
                        .dayOfWeek(t.getDayOfWeek())
                        .slot(t.getSlot())
                        .room(t.getRoom())
                        .className(c.getName())
                        .build()).collect(Collectors.toSet()) : null)
                .build()
        ).collect(Collectors.toList());
    }

    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream().map(s -> SubjectDTO.builder()
                .subjectCode(s.getSubjectCode())
                .name(s.getName())
                .specialization(s.getSpecialization())
                .build()
        ).collect(Collectors.toList());
    }

    public List<SyllabusListDTO> getAllSyllabi() {
        return syllabusRepository.findAll().stream().map(s -> SyllabusListDTO.builder()
                .id(s.getId())
                .subjectName(s.getSubject() != null ? s.getSubject().getName() : "Unknown Subject")
                .year(s.getYear())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public void updateApprovedProject(Long projectId, HeadProjectDTO dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException("Không tìm thấy đề tài", HttpStatus.NOT_FOUND));

        project.setName(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setTechnology(dto.getTechnology());
        project.setMaxStudents(dto.getMaxStudents());

        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            try {
                project.setStatus(ProjectStatus.valueOf(dto.getStatus()));
            } catch (IllegalArgumentException e) {
            }
        }
        projectRepository.save(project);
    }
}