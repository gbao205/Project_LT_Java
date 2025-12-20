package com.cosre.backend.service;

import com.cosre.backend.dto.student.CreateTeamRequest;
import com.cosre.backend.dto.student.ProjectRegistrationRequest;
import com.cosre.backend.entity.*;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final MilestoneRepository milestoneRepository;
    private final StudentRepository studentRepository;

    // Helper lấy User hiện tại từ Security Context
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.UNAUTHORIZED));
    }

    // Lấy thông tin hồ sơ của sinh viên hiện tại
    public Student getMyProfile() {
        User user = getCurrentUser();
        // Trả về Student từ DB, nếu chưa có thì tạo đối tượng Student mới (chưa lưu vào DB)
        // để Frontend có cấu trúc dữ liệu hiển thị (tên, email từ User)
        return studentRepository.findByUser(user)
                .orElseGet(() -> Student.builder()
                        .user(user)
                        .profile(new StudentProfile()) // Tránh lỗi null profile ở Frontend
                        .build());
    }

    // Cập nhật hồ sơ sinh viên
    @Transactional
    public Student updateProfile(Student request) {
        User currentUser = getCurrentUser();

        // Tìm hồ sơ cũ, nếu không có thì tạo thực thể Student mới hoàn toàn
        Student student = studentRepository.findByUser(currentUser)
                .orElse(new Student());

        // Nếu là tạo mới, cần thiết lập quan hệ với User
        if (student.getId() == null) {
            student.setUser(currentUser);
        }

        // --- Cập nhật THÔNG TIN CÁ NHÂN từ request ---
        if (request.getProfile() != null) {
            StudentProfile newProfile = request.getProfile();
            // Map các trường: gender, ethnicity, religion, nationality, phone, v.v.
            student.setProfile(newProfile);
        }

        // --- Cập nhật một số trường Học vấn nếu được phép ---
        // Ví dụ: Ngày sinh (dob) thường nằm ở Student chứ không phải Profile
        student.setDob(request.getDob());
        student.setStudentId(request.getStudentId());

        // Lưu xuống DB (Nếu là hồ sơ mới thì Hibernate sẽ thực hiện INSERT)
        return studentRepository.save(student);
    }

    // 1. Chức năng: Tạo nhóm mới (Sinh viên tạo sẽ là LEADER)
    @Transactional
    public Team createTeam(CreateTeamRequest request) {
        User student = getCurrentUser();

        // Kiểm tra sinh viên đã có nhóm trong lớp này chưa
        boolean alreadyInTeam = teamMemberRepository.existsByTeam_ClassRoom_IdAndStudent_Id(request.getClassId(), student.getId());
        if (alreadyInTeam) {
            throw new AppException("Bạn đã tham gia một nhóm trong lớp này rồi!", HttpStatus.BAD_REQUEST);
        }

        ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                .orElseThrow(() -> new AppException("Lớp học không tồn tại", HttpStatus.NOT_FOUND));

        // Tạo Team
        Team team = Team.builder()
                .teamName(request.getTeamName())
                .classRoom(classRoom)
                .build();
        team = teamRepository.save(team);

        // Thêm thành viên là Leader
        TeamMember member = TeamMember.builder()
                .team(team)
                .student(student)
                .role(TeamRole.LEADER) // Role trong nhóm
                .build();
        teamMemberRepository.save(member);

        return team;
    }

    // 2. Chức năng: Tham gia nhóm (Cần logic mời hoặc mã join, ở đây làm đơn giản là Join thẳng)
    @Transactional
    public void joinTeam(Long teamId) {
        User student = getCurrentUser();
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException("Nhóm không tồn tại", HttpStatus.NOT_FOUND));

        // Kiểm tra đã vào nhóm chưa
        if (teamMemberRepository.existsByTeam_IdAndStudent_Id(teamId, student.getId())) {
            throw new AppException("Bạn đã là thành viên nhóm này", HttpStatus.BAD_REQUEST);
        }

        // Tạo member mới
        TeamMember member = TeamMember.builder()
                .team(team)
                .student(student)
                .role(TeamRole.MEMBER) // Thành viên thường
                .build();
        teamMemberRepository.save(member);
    }

    // 3. Chức năng: Đăng ký/Đề xuất đề tài (Chỉ Leader được làm)
    @Transactional
    public Team registerProject(ProjectRegistrationRequest request) {
        User student = getCurrentUser();

        // Tìm nhóm mà sinh viên này làm Leader
        TeamMember leadership = teamMemberRepository.findByStudent_IdAndRole(student.getId(), TeamRole.LEADER)
                .orElseThrow(() -> new AppException("Bạn không phải là nhóm trưởng hoặc chưa có nhóm!", HttpStatus.FORBIDDEN));

        Team team = leadership.getTeam();

        Project project;
        if (request.getExistingProjectId() != null) {
            // Case A: Chọn đề tài có sẵn (Do giảng viên tạo)
            project = projectRepository.findById(request.getExistingProjectId())
                    .orElseThrow(() -> new AppException("Đề tài không tồn tại", HttpStatus.NOT_FOUND));
            // Có thể check thêm status Project có là APPROVED không
        } else {
            // Case B: Đề xuất đề tài mới
            project = Project.builder()
                    .name(request.getProjectName())
                    .description(request.getDescription())
                    .status(ProjectStatus.PENDING) // Chờ duyệt
                    .build();
            project = projectRepository.save(project);
        }

        // Gán đề tài cho nhóm
        team.setProject(project);
        return teamRepository.save(team);
    }

    // 4. Chức năng: Xem danh sách Milestone (Hạn nộp) của lớp
    public List<Milestone> getClassMilestones(Long classId) {
        return milestoneRepository.findByClassRoom_Id(classId); // Cần tạo method này trong Repo
    }
}