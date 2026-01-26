package com.cosre.backend.service;

import com.cosre.backend.dto.DashboardStats;
import com.cosre.backend.dto.lecturer.*;
import com.cosre.backend.entity.*;
import com.cosre.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import java.io.IOException;          // ✅ Mới
import java.nio.file.Files;          // ✅ Mới
import java.nio.file.Path;           // ✅ Mới
import java.nio.file.Paths;          // ✅ Mới
import java.nio.file.StandardCopyOption;

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

    @Autowired
    private AssignmentRepository assignmentRepository;

    // ✅ Bắt buộc phải có 2 Repo này để chấm điểm và xem bài nộp
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private EvaluationRepository evaluationRepository;
    @Autowired
    private CourseMaterialRepository courseMaterialRepository;

    // =========================================================================
    // 1. LẤY DANH SÁCH LỚP (KÈM DANH SÁCH BÀI TẬP ĐÃ GIAO)
    // =========================================================================
    public List<LecturerClassDetailDTO> getMyClasses(String email) {
        List<ClassRoom> classes = classRoomRepository.findByLecturerEmail(email);

        return classes.stream().map(cls -> {
            // A. Map Teams & Students
            List<LecturerTeamDTO> teamDTOs = new ArrayList<>();
            if (cls.getTeams() != null) {
                teamDTOs = cls.getTeams().stream().map(team -> {
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

            // B. Map Assignments (Để hiển thị list bài tập ở ClassManager)
            List<LecturerAssignmentDTO> assignmentDTOs = new ArrayList<>();
            if (assignmentRepository != null) {
                List<Assignment> assignments = assignmentRepository.findByClassRoom(cls);
                assignmentDTOs = assignments.stream().map(a -> LecturerAssignmentDTO.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        .dueDate(a.getDeadline() != null ? a.getDeadline().toLocalDate().toString() : "")
                        .type("CLASS_ASSIGNMENT") // Mặc định
                        .status("ACTIVE")       // Mặc định
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
                    .assignments(assignmentDTOs)
                    .build();

        }).collect(Collectors.toList());
    }

    // =========================================================================
    // 2. DASHBOARD STATS
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

    // =========================================================================
    // 3. LẤY ĐỀ TÀI SINH VIÊN GỬI
    // =========================================================================
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

    // =========================================================================
    // 4. DUYỆT ĐỀ TÀI
    // =========================================================================
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

    // =========================================================================
    // 5. LẤY DANH SÁCH PHẢN BIỆN (Xem mình phải review ai)
    // =========================================================================
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
                    .reviewScore(p.getReviewScore())
                    .reviewComment(p.getReviewComment())
                    .build();
        }).collect(Collectors.toList());
    }

    // =========================================================================
    // 6. TẠO ĐỀ TÀI MỚI (CÓ UPLOAD FILE)
    // =========================================================================
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

    // =========================================================================
    // 7. LẤY DANH SÁCH ĐỀ TÀI TÔI ĐÃ GỬI
    // =========================================================================
    public List<ProposalDTO> getMyCreatedProposals(String email) {
        try {
            User owner = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));

            List<Project> projects = projectRepository.findByOwner(owner);
            List<ProposalDTO> dtos = new ArrayList<>();
            for (Project p : projects) {
                String statusStr = (p.getStatus() != null) ? p.getStatus().name() : "PENDING";
                String subDateStr = (p.getSubmittedDate() != null) ? p.getSubmittedDate().toString() : "";
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
            }
            return dtos;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    // =========================================================================
    // 8. CHẤM ĐIỂM PHẢN BIỆN
    // =========================================================================
    public void gradeReviewProject(Long projectId, Double score, String comment, String reviewerEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài ID: " + projectId));

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên: " + reviewerEmail));

        if (project.getReviewer() == null || !project.getReviewer().getId().equals(reviewer.getId())) {
            throw new RuntimeException("Bạn không được phân công phản biện đề tài này!");
        }

        project.setReviewScore(score);
        project.setReviewComment(comment);
        projectRepository.save(project);
    }

    // =========================================================================
    // 9. GIAO BÀI TẬP (CẬP NHẬT: THÊM THAM SỐ TYPE)
    // =========================================================================
    public void createAssignment(Long classId, String title, String description, String type, String deadline, MultipartFile file) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        Assignment assignment = new Assignment();
        assignment.setTitle(title);
        assignment.setDescription(description);
        assignment.setClassRoom(classRoom);

        // --- Xử lý loại bài tập (Nếu có Enum thì parse, không thì lưu String) ---
        // Ví dụ: assignment.setType(AssignmentType.valueOf(type));
        // Hiện tại nếu Entity chưa có field type thì ta bỏ qua hoặc ghi vào description
        if (type != null) {
            System.out.println("Loại bài tập: " + type);
        }

        // Xử lý hạn nộp
        try {
            assignment.setDeadline(LocalDateTime.parse(deadline));
        } catch (Exception e) {
            assignment.setDeadline(LocalDateTime.now().plusDays(7));
        }

        // Xử lý file
        if (file != null && !file.isEmpty()) {
            String savedFileName = saveFileToDisk(file);
            assignment.setDescription(assignment.getDescription() + "\n[File đính kèm: " + savedFileName + "]");
        }

        assignmentRepository.save(assignment);
    }


    // =========================================================================
    // 10. LẤY CHI TIẾT BÀI TẬP CỦA SINH VIÊN (ĐÃ FIX LỖI BIGDECIMAL)
    // =========================================================================
    public List<StudentAssignmentDTO> getStudentAssignments(Long studentId, Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp không tồn tại"));

        List<Assignment> assignments = assignmentRepository.findByClassRoom(classRoom);
        List<StudentAssignmentDTO> result = new ArrayList<>();

        for (Assignment asm : assignments) {
            Submission sub = submissionRepository.findFirstByAssignment_IdAndStudent_IdOrderBySubmittedAtDesc(asm.getId(), studentId).orElse(null);
            Evaluation eval = evaluationRepository.findFirstByAssignment_IdAndStudent_IdOrderByEvaluatedAtDesc(asm.getId(), studentId).orElse(null);

            String status = "MISSING";
            String subDate = "";
            String subFile = "";
            BigDecimal score = null; // Dùng BigDecimal chuẩn
            String feedback = "";

            if (sub != null) {
                status = "SUBMITTED";
                subDate = sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : "";
                subFile = sub.getFileUrl();

                if (asm.getDeadline() != null && sub.getSubmittedAt() != null && sub.getSubmittedAt().isAfter(asm.getDeadline())) {
                    status = "LATE";
                }
            } else {
                if (asm.getDeadline() != null && LocalDateTime.now().isBefore(asm.getDeadline())) {
                    status = "PENDING";
                }
            }

            // --- FIX LỖI Ở ĐÂY ---
            if (eval != null) {
                // Nếu trong Entity Evaluation, score là BigDecimal -> Gán trực tiếp
                score = eval.getScore();

                // Nếu trong Entity Evaluation, score là Double -> Dùng BigDecimal.valueOf(eval.getScore())
                // Nhưng theo Entity tôi gửi ở Bước 1, nó là BigDecimal, nên gán trực tiếp là đúng.

                feedback = eval.getComment();
            }

            result.add(StudentAssignmentDTO.builder()
                    .id(asm.getId())
                    .title(asm.getTitle())
                    .description(asm.getDescription())
                    .deadline(asm.getDeadline() != null ? asm.getDeadline().toString() : "")
                    .status(status)
                    .submissionDate(subDate)
                    .submissionFile(subFile)
                    .score(score)
                    .feedback(feedback)
                    .build());
        }
        return result;
    }

    // =========================================================================
    // 11. CHẤM ĐIỂM BÀI TẬP (ĐÃ FIX LỖI SETTER)
    // =========================================================================
    public void gradeAssignment(Long studentId, Long assignmentId, Double scoreVal, String comment) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại"));
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Bài tập không tồn tại"));

        // Tìm Evaluation cũ hoặc tạo mới
        Evaluation eval = evaluationRepository.findFirstByAssignment_IdAndStudent_IdOrderByEvaluatedAtDesc(assignmentId, studentId)
                .orElse(new Evaluation());

        eval.setStudent(student);

        // --- FIX LỖI Ở ĐÂY (Đã thêm trường assignment vào Entity) ---
        eval.setAssignment(assignment);

        // --- FIX LỖI TYPE (Double -> BigDecimal) ---
        // Đầu vào scoreVal là Double, Entity cần BigDecimal -> Phải convert
        eval.setScore(BigDecimal.valueOf(scoreVal));

        eval.setComment(comment);

        // --- FIX LỖI Ở ĐÂY (Đã thêm trường evaluatedAt vào Entity) ---
        eval.setEvaluatedAt(LocalDateTime.now());

        evaluationRepository.save(eval);
    }

    // =========================================================================
    // 12. UPLOAD TÀI LIỆU HỌC TẬP (CÓ LƯU FILE THẬT)
    // =========================================================================
    public void uploadMaterial(Long classId, String title, String description, MultipartFile file) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setDescription(description);
        material.setClassRoom(classRoom);
        material.setUploadDate(LocalDateTime.now());

        // ✅ LOGIC LƯU FILE THẬT
        if (file != null && !file.isEmpty()) {
            String savedFileName = saveFileToDisk(file); // Gọi hàm lưu file
            material.setFileUrl(savedFileName); // Lưu tên file vào DB
        }

        courseMaterialRepository.save(material);
    }

    // =========================================================================
    // 13. LẤY DANH SÁCH TÀI LIỆU CỦA LỚP
    // =========================================================================
    public List<CourseMaterial> getClassMaterials(Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));
        return courseMaterialRepository.findByClassRoom(classRoom);
    }

    // =========================================================================
    //  HÀM HỖ TRỢ: LƯU FILE VÀO Ổ CỨNG (Private)
    // =========================================================================
    private String saveFileToDisk(MultipartFile file) {
        try {
            // 1. Định nghĩa thư mục lưu: "uploads" nằm ngay trong thư mục dự án
            String uploadDir = "uploads";
            Path uploadPath = Paths.get(uploadDir);

            // 2. Tạo thư mục nếu chưa có
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 3. Tạo tên file duy nhất (để tránh trùng lặp)
            // Ví dụ: file_goc.pdf -> 1738293_file_goc.pdf
            String originalName = file.getOriginalFilename();
            String fileName = System.currentTimeMillis() + "_" + originalName;

            // 4. Lưu file
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("✅ Đã lưu file thành công tại: " + filePath.toAbsolutePath());
            return fileName; // Trả về tên file để lưu vào Database

        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file: " + e.getMessage());
        }
    }


}