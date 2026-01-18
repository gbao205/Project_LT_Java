package com.cosre.backend.service;

import com.cosre.backend.dto.DashboardStats;
import com.cosre.backend.dto.lecturer.ClassProposalDTO;
import com.cosre.backend.dto.lecturer.ProposalDTO;
import com.cosre.backend.entity.*;
import com.cosre.backend.repository.ClassRoomRepository;
import com.cosre.backend.repository.ProjectRepository;
import com.cosre.backend.repository.TeamRepository;
import com.cosre.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    // 1. Lấy danh sách lớp
    public List<ClassRoom> getMyClasses(String email) {
        return classRoomRepository.findByLecturerEmail(email);
    }

    // 2. Thống kê Dashboard
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

    // 3. Lấy danh sách đề tài sinh viên gửi (để duyệt)
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

                    // Xử lý an toàn null cho status
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

    // 4. Update trạng thái
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

    // 5. Lấy danh sách phản biện
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
                    .build();
        }).collect(Collectors.toList());
    }

    // 6. Tạo đề tài mới
    public void createProposal(ProposalDTO dto, String email) {
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

        projectRepository.save(project);
    }

    // 7. Lấy danh sách đề tài tôi đã gửi
    public List<ProposalDTO> getMyCreatedProposals(String email) {
        System.out.println("--- BẮT ĐẦU GỌI API MY-PROPOSALS ---");
        try {
            // 1. Tìm User
            System.out.println("1. Tìm giảng viên email: " + email);
            User owner = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));

            // 2. Tìm Projects
            System.out.println("2. Tìm project trong DB...");
            List<Project> projects = projectRepository.findByOwner(owner);
            System.out.println("-> Tìm thấy " + projects.size() + " đề tài.");

            // 3. Convert sang DTO (Có try-catch từng dòng để tìm lỗi null)
            List<ProposalDTO> dtos = new ArrayList<>();
            for (Project p : projects) {
                try {
                    System.out.println("-> Đang xử lý Project ID: " + p.getId());

                    String statusStr = (p.getStatus() != null) ? p.getStatus().name() : "PENDING";
                    // Kiểm tra null cho ngày tháng
                    String subDateStr = "";
                    if (p.getSubmittedDate() != null) {
                        subDateStr = p.getSubmittedDate().toString();
                    }

                    // Kiểm tra null cho số nguyên
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
                            .build();
                    dtos.add(dto);

                } catch (Exception ex) {
                    System.err.println("!!! LỖI TẠI PROJECT ID " + p.getId() + ": " + ex.getMessage());
                    ex.printStackTrace(); // In lỗi ra console để xem
                }
            }

            System.out.println("--- KẾT THÚC THÀNH CÔNG ---");
            return dtos;

        } catch (Exception e) {
            System.err.println("!!! LỖI NGHIÊM TRỌNG TRONG SERVICE: " + e.getMessage());
            e.printStackTrace();
            throw e; // Ném lỗi ra để Controller biết
        }
    }
}