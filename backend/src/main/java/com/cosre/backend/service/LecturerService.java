package com.cosre.backend.service;

import com.cosre.backend.dto.DashboardStats;
import com.cosre.backend.dto.lecturer.*;
import com.cosre.backend.entity.*;
import com.cosre.backend.repository.*;
import com.cosre.backend.dto.lecturer.LecturerAssignmentDTO;// Import cả AssignmentRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
public class LecturerService {

    @Autowired
    private ClassRoomRepository classRoomRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ Đã có file Repository rồi -> Bỏ comment dòng này
    @Autowired
    private AssignmentRepository assignmentRepository;

    // =========================================================================
    // 1. LẤY DANH SÁCH LỚP (CÓ MAP SANG DTO CHI TIẾT + BÀI TẬP)
    // =========================================================================
    public List<LecturerClassDetailDTO> getMyClasses(String email) {
        List<ClassRoom> classes = classRoomRepository.findByLecturerEmail(email);

        return classes.stream().map(cls -> {
            // --- A. Map Danh sách Nhóm ---
            List<LecturerTeamDTO> teamDTOs = new ArrayList<>();
            if (cls.getTeams() != null) {
                teamDTOs = cls.getTeams().stream().map(team -> {
                    // --- B. Map Danh sách Sinh viên ---
                    List<LecturerStudentDTO> memberDTOs = new ArrayList<>();
                    if (team.getMembers() != null) {
                        memberDTOs = team.getMembers().stream().map(mem -> {
                            User s = mem.getStudent();
                            BigDecimal score = (mem.getFinalGrade() != null) ? mem.getFinalGrade() : BigDecimal.ZERO;

                            return LecturerStudentDTO.builder()
                                    .id(s.getId())
                                    .fullName(s.getFullName())
                                    .code(s.getCode())
                                    .score(score)
                                    .build();
                        }).collect(Collectors.toList());
                    }

                    BigDecimal teamScore = (team.getTeamScore() != null) ? team.getTeamScore() : BigDecimal.ZERO;

                    return LecturerTeamDTO.builder()
                            .id(team.getId())
                            .name(team.getTeamName())
                            .teamScore(teamScore)
                            .maxMembers(cls.getMaxCapacity())
                            .members(memberDTOs)
                            .build();
                }).collect(Collectors.toList());
            }

            int totalStudents = teamDTOs.stream().mapToInt(t -> t.getMembers().size()).sum();

            // --- C. Map Danh sách Bài tập (Assignment) ---
            List<LecturerAssignmentDTO> assignmentDTOs = new ArrayList<>();

            // ✅ Logic mới khớp với file AssignmentRepository bạn gửi
            if (assignmentRepository != null) {
                // Gọi hàm findByClassRoom (truyền object cls thay vì ID)
                List<Assignment> assignments = assignmentRepository.findByClassRoom(cls);

                assignmentDTOs = assignments.stream().map(a -> LecturerAssignmentDTO.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        // Entity của bạn chỉ có 'deadline', không có start/end hay type/status
                        // -> Map deadline vào dueDate
                        .dueDate(a.getDeadline() != null ? a.getDeadline().toLocalDate().toString() : "")

                        // -> Gán mặc định để Frontend hiển thị đẹp (vì DB chưa có cột này)
                        .type("CLASS_ASSIGNMENT")
                        .status("ACTIVE")
                        .build()
                ).collect(Collectors.toList());
            }

            return LecturerClassDetailDTO.builder()
                    .id(cls.getId())
                    .name(cls.getName())
                    .subjectCode(cls.getSubject() != null ? cls.getSubject().getSubjectCode() : "N/A")
                    .subjectName(cls.getSubject() != null ? cls.getSubject().getName() : "N/A")
                    .studentCount(totalStudents)
                    .teams(teamDTOs)
                    .assignments(assignmentDTOs) // ✅ Đưa list bài tập vào
                    .build();

        }).collect(Collectors.toList());
    }

    // =========================================================================
    // CÁC HÀM KHÁC GIỮ NGUYÊN
    // =========================================================================

    public DashboardStats getLecturerStats(String email) {
        List<ClassRoom> classes = classRoomRepository.findByLecturerEmail(email);
        long activeClasses = classes.size();
        long totalStudents = 0;
        long pendingRequests = 0;

        for (ClassRoom cls : classes) {
            totalStudents += cls.getStudents().size();
            List<Team> teams = teamRepository.findByClassRoom_Id(cls.getId());
            for (Team team : teams) {
                if (team.getProject() != null && team.getProject().getStatus() == ProjectStatus.PENDING) {
                    pendingRequests++;
                }
            }
        }
        return new DashboardStats(0L, 0L, activeClasses, 0L, 0L, pendingRequests, totalStudents);
    }

    public List<ClassProposalDTO> getProposalsByLecturer(String email) {
        List<ClassRoom> classes = classRoomRepository.findByLecturerEmail(email);
        List<ClassProposalDTO> result = new ArrayList<>();

        for (ClassRoom cls : classes) {
            List<Team> teams = teamRepository.findByClassRoom_Id(cls.getId());
            List<ProposalDTO> proposalDTOS = new ArrayList<>();
            int pendingCount = 0;

            for (Team team : teams) {
                Project project = team.getProject();
                if (project != null) {
                    List<String> studentNames = team.getMembers().stream()
                            .map(m -> m.getStudent().getFullName() + " (" + m.getStudent().getCode() + ")")
                            .collect(Collectors.toList());

                    String statusStr = project.getStatus() != null ? project.getStatus().name() : "UNKNOWN";

                    ProposalDTO dto = ProposalDTO.builder()
                            .id(project.getId())
                            .groupName(team.getTeamName())
                            .students(studentNames)
                            .title(project.getName())
                            .titleEn("")
                            .description(project.getDescription())
                            .technology("")
                            .status(statusStr)
                            .submittedDate("2024-01-01")
                            .build();

                    proposalDTOS.add(dto);

                    if (project.getStatus() == ProjectStatus.PENDING) {
                        pendingCount++;
                    }
                }
            }
            ClassProposalDTO classDto = ClassProposalDTO.builder()
                    .id(cls.getId())
                    .name(cls.getName())
                    .semester(cls.getSemester())
                    .pendingCount(pendingCount)
                    .proposals(proposalDTOS)
                    .build();
            result.add(classDto);
        }
        return result;
    }

    public void updateProjectStatus(Long projectId, String status, String reason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài ID: " + projectId));

        if ("APPROVED".equalsIgnoreCase(status)) {
            project.setStatus(ProjectStatus.APPROVED);
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            project.setStatus(ProjectStatus.REJECTED);
        } else {
            throw new RuntimeException("Trạng thái không hợp lệ");
        }
        projectRepository.save(project);
    }

    public List<ProposalDTO> getAssignedReviewProjects(String email) {
        User reviewer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên: " + email));

        List<Project> projects = projectRepository.findByReviewer(reviewer);

        return projects.stream().map(p -> {
            String statusStr = p.getStatus() != null ? p.getStatus().name() : "UNKNOWN";
            return ProposalDTO.builder()
                    .id(p.getId())
                    .title(p.getName())
                    .description(p.getDescription())
                    .technology(p.getTechnology() != null ? p.getTechnology() : "")
                    .maxStudents(p.getMaxStudents() != null ? p.getMaxStudents() : 0)
                    .status(statusStr)
                    .submittedDate(p.getSubmittedDate() != null ? p.getSubmittedDate().toString() : "")
                    .groupName("")
                    .students(new ArrayList<>())
                    .titleEn("")
                    // --- [MỚI] THÊM 2 DÒNG NÀY ĐỂ HIỆN LỊCH SỬ CHẤM ---
                    .reviewScore(p.getReviewScore())
                    .reviewComment(p.getReviewComment())
                    .build();
        }).collect(Collectors.toList());
    }

    public void createProposal(ProposalDTO dto, MultipartFile file, String email) {
        User lecturer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên: " + email));

        Project project = new Project();
        project.setName(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setTechnology(dto.getTechnology());
        project.setMaxStudents(dto.getMaxStudents() != null ? dto.getMaxStudents() : 0);
        project.setOwner(lecturer);
        project.setStatus(ProjectStatus.PENDING);
        project.setSubmittedDate(LocalDate.now());

        if (file != null && !file.isEmpty()) {
            String fileName = file.getOriginalFilename();
            System.out.println(">>> Đã nhận file: " + fileName);
        }

        projectRepository.save(project);
    }

    public List<ProposalDTO> getMyCreatedProposals(String email) {
        System.out.println("--- BẮT ĐẦU GỌI API MY-PROPOSALS ---");
        try {
            User owner = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));

            List<Project> projects = projectRepository.findByOwner(owner);

            List<ProposalDTO> dtos = new ArrayList<>();
            for (Project p : projects) {
                try {
                    String statusStr = (p.getStatus() != null) ? p.getStatus().name() : "PENDING";
                    String subDateStr = "";
                    if (p.getSubmittedDate() != null) {
                        subDateStr = p.getSubmittedDate().toString();
                    }
                    Integer maxStu = (p.getMaxStudents() != null) ? p.getMaxStudents() : 0;
                    String tech = (p.getTechnology() != null) ? p.getTechnology() : "";
                    String desc = (p.getDescription() != null) ? p.getDescription() : "";
                    String title = (p.getName() != null) ? p.getName() : "Không tên";

                    ProposalDTO dto = ProposalDTO.builder()
                            .id(p.getId())
                            .title(title)
                            .description(desc)
                            .technology(tech)
                            .maxStudents(maxStu)
                            .status(statusStr)
                            .submittedDate(subDateStr)
                            .groupName("")
                            .students(new ArrayList<>())
                            .titleEn("")
                            .reviewScore(p.getReviewScore())
                            .reviewComment(p.getReviewComment())
                            .build();
                    dtos.add(dto);

                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
            return dtos;

        } catch (Exception e) {
            System.err.println("!!! LỖI NGHIÊM TRỌNG TRONG SERVICE: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    /**
     * Chức năng: Giảng viên phản biện chấm điểm và gửi nhận xét
     */
    public void gradeReviewProject(Long projectId, Double score, String comment, String reviewerEmail) {
        // 1. Tìm đề tài
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài ID: " + projectId));

        // 2. Tìm giảng viên đang thao tác
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên: " + reviewerEmail));

        // 3. KIỂM TRA QUYỀN: Người này có đúng là Reviewer của đề tài không?
        if (project.getReviewer() == null || !project.getReviewer().getId().equals(reviewer.getId())) {
            throw new RuntimeException("Bạn không được phân công phản biện đề tài này, không thể chấm điểm!");
        }

        // 4. Lưu kết quả vào database
        project.setReviewScore(score);
        project.setReviewComment(comment);
        projectRepository.save(project);
        System.out.println(">>> Đã chấm điểm đề tài ID " + projectId + ": " + score + " điểm.");
    }
}