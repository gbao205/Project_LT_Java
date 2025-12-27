package com.cosre.backend.service;

import com.cosre.backend.dto.student.CreateTeamRequest;
import com.cosre.backend.dto.student.ProjectRegistrationRequest;
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

@Service
@RequiredArgsConstructor
public class StudentService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;


    // --- 1. CÁC HÀM BỔ TRỢ ---
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



    // --- 2. QUẢN LÝ HỒ SƠ ---

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


    // --- 3. QUẢN LÝ NHÓM (TEAM) ---

    // Lấy thông tin nhóm của tôi trong lớp
    public Team getMyTeam(Long classId) {
        User student = getCurrentUser();
        return teamMemberRepository.findByStudent_IdAndTeam_ClassRoom_Id(student.getId(), classId)
                .map(TeamMember::getTeam)
                .orElse(null);
    }

    // Lấy danh sách các nhóm trong lớp (để xin vào)
    public List<Team> getAvailableTeams(Long classId) {
        return teamRepository.findByClassRoom_Id(classId);
    }

    // Tạo nhóm mới
    @Transactional
    public Team createTeam(CreateTeamRequest request) {
        User student = getCurrentUser();

        if (teamMemberRepository.existsByStudent_IdAndTeam_ClassRoom_Id(student.getId(), request.getClassId())) {
            throw new AppException("Bạn đã tham gia một nhóm trong lớp này rồi!", HttpStatus.BAD_REQUEST);
        }

        ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                .orElseThrow(() -> new AppException("Lớp học không tồn tại", HttpStatus.NOT_FOUND));

        Team team = Team.builder()
                .teamName(request.getTeamName())
                .classRoom(classRoom)
                .build();
        team = teamRepository.save(team);

        TeamMember member = TeamMember.builder()
                .team(team)
                .student(student)
                .role(TeamRole.LEADER)
                .build();
        teamMemberRepository.save(member);

        return team;
    }

    // Tham gia nhóm
    @Transactional
    public void joinTeam(Long teamId) {
        User student = getCurrentUser();
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException("Nhóm không tồn tại", HttpStatus.NOT_FOUND));

        if (teamMemberRepository.existsByStudent_IdAndTeam_ClassRoom_Id(student.getId(), team.getClassRoom().getId())) {
            throw new AppException("Bạn đã có nhóm trong lớp này!", HttpStatus.BAD_REQUEST);
        }

        TeamMember member = TeamMember.builder()
                .team(team)
                .student(student)
                .role(TeamRole.MEMBER)
                .build();
        teamMemberRepository.save(member);
    }

    // --- 4. QUẢN LÝ ĐỀ TÀI & MILESTONE ---

    // Đăng ký đề tài
    @Transactional
    public Team registerProject(ProjectRegistrationRequest request) {
        User student = getCurrentUser();

        // Tìm quyền Leader của sinh viên
        TeamMember leadership = teamMemberRepository.findByStudent_IdAndRole(student.getId(), TeamRole.LEADER)
                .orElseThrow(() -> new AppException("Bạn không phải nhóm trưởng hoặc chưa có nhóm!", HttpStatus.FORBIDDEN));

        Team team = leadership.getTeam();

        Project project;
        if (request.getExistingProjectId() != null) {
            project = projectRepository.findById(request.getExistingProjectId())
                    .orElseThrow(() -> new AppException("Đề tài không tồn tại", HttpStatus.NOT_FOUND));
        } else {
            project = Project.builder()
                    .name(request.getProjectName())
                    .description(request.getDescription())
                    .status(ProjectStatus.PENDING)
                    .build();
            project = projectRepository.save(project);
        }

        team.setProject(project);
        return teamRepository.save(team);
    }

    // Lấy Milestone (Mốc thời gian)
    public List<Milestone> getClassMilestones(Long classId) {
        return milestoneRepository.findByClassRoom_Id(classId);
    }
}