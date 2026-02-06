package com.cosre.backend.service;

import com.cosre.backend.dto.staff.ClassResponseDTO;
import com.cosre.backend.dto.student.CreateTeamRequest;
import com.cosre.backend.dto.student.ProjectRegistrationRequest;
import com.cosre.backend.dto.student.JoinTeamRequest;
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
import java.util.UUID;

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
    public User getCurrentUser() {
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

    // Hàm lấy danh sách sinh viên chưa có nhóm
    public List<User> getStudentsWithoutTeam(Long classId) {
        return userRepository.findUsersWithoutTeamInClass(classId);
    }

    // Tạo nhóm mới
    @Transactional
    public Team createTeam(CreateTeamRequest request) {
        User currentUser = getCurrentUser();

        // Kiểm tra xem đã có nhóm chưa
        if (teamMemberRepository.existsByStudent_IdAndTeam_ClassRoom_Id(currentUser.getId(), request.getClassId())) {
            throw new AppException("Bạn đã tham gia một nhóm trong lớp này rồi!", HttpStatus.BAD_REQUEST);
        }

        ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                .orElseThrow(() -> new AppException("Lớp học không tồn tại", HttpStatus.NOT_FOUND));

        // Tạo Team
        Team team = new Team();
        team.setTeamName(request.getTeamName());
        team.setClassRoom(classRoom);
        team.setJoinCode(generateJoinCode());

        teamRepository.save(team);

        // Thêm Leader (người tạo)
        TeamMember leader = new TeamMember();
        leader.setStudent(currentUser);
        leader.setTeam(team);
        leader.setRole(TeamRole.LEADER);
        teamMemberRepository.save(leader);

        // THÊM THÀNH VIÊN ĐƯỢC CHỌN
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            List<User> selectedUsers = userRepository.findAllById(request.getMemberIds());

            for (User selectedUser : selectedUsers) {
                // Bỏ qua nếu chọn trúng chính mình
                if (selectedUser.getId().equals(currentUser.getId())) continue;

                TeamMember member = new TeamMember();
                member.setStudent(selectedUser);
                member.setTeam(team);
                member.setRole(TeamRole.MEMBER);
                teamMemberRepository.save(member);
            }
        }

        return team;
    }

    private String generateJoinCode() {
        // Tạo chuỗi ngẫu nhiên 6 ký tự (VD: A1B2C3)
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    // Tham gia nhóm
    @Transactional
    public void joinTeam(JoinTeamRequest request) {
        User student = getCurrentUser();
        
        // 1. Tìm nhóm bằng joinCode
        Team team = teamRepository.findByJoinCode(request.getJoinCode())
                .orElseThrow(() -> new AppException("Mã nhóm không tồn tại hoặc không hợp lệ!", HttpStatus.NOT_FOUND));

        // 2. Kiểm tra xem sinh viên đã có nhóm trong lớp này chưa
        if (teamMemberRepository.existsByStudent_IdAndTeam_ClassRoom_Id(student.getId(), team.getClassRoom().getId())) {
            throw new AppException("Bạn đã tham gia một nhóm khác trong lớp này rồi!", HttpStatus.BAD_REQUEST);
        }

        // 3. Thêm vào nhóm
        TeamMember member = TeamMember.builder()
                .team(team)
                .student(student)
                .role(TeamRole.MEMBER)
                .build();
        
        teamMemberRepository.save(member);
    }

    // rời nhóm
    @Transactional
    public void leaveTeam(Long teamId) {
        // 1. Lấy User hiện tại
        User user = getCurrentUser();

        // 2. Tìm thành viên trong nhóm
        TeamMember currentMember = teamMemberRepository.findByTeam_IdAndStudent_Id(teamId, user.getId())
                .orElseThrow(() -> new AppException("Bạn không phải thành viên của nhóm này", HttpStatus.BAD_REQUEST));

        // Nếu KHÔNG phải Leader -> Xóa và kết thúc ngay lập tức (return)
        if (currentMember.getRole() != TeamRole.LEADER) {
            teamMemberRepository.delete(currentMember);
            return;
        }

        // 3. Xử lý riêng cho Leader (chỉ chạy xuống đây nếu là LEADER)
        Team team = currentMember.getTeam();

        // Lấy danh sách thành viên CÒN LẠI (trừ Leader đang rời đi)
        List<TeamMember> remainingMembers = team.getMembers().stream()
                .filter(m -> !m.getId().equals(currentMember.getId()))
                .toList();

        if (remainingMembers.isEmpty()) {
            // Trường hợp: Không còn ai -> Xóa nhóm
            // Xóa thành viên trước
            teamMemberRepository.delete(currentMember);
            // Sau đó xóa nhóm
            teamRepository.delete(team);
        } else {
            // Trường hợp: Còn thành viên -> Chọn người kế vị (người vào nhóm sớm nhất)
            TeamMember newLeader = remainingMembers.get(0);
            newLeader.setRole(TeamRole.LEADER);
            teamMemberRepository.save(newLeader);

            // Xóa Leader cũ
            teamMemberRepository.delete(currentMember);
        }
    }

    // Chuyển quyền Leader cho thành viên khác
    @Transactional
    public void assignLeader(Long teamId, Long newLeaderId) {
        User currentUser = getCurrentUser();

        // 1. Kiểm tra quyền Leader hiện tại
        TeamMember currentLeader = teamMemberRepository.findByTeam_IdAndStudent_Id(teamId, currentUser.getId())
                .orElseThrow(() -> new AppException("Bạn không thuộc nhóm này", HttpStatus.BAD_REQUEST));

        if (currentLeader.getRole() != TeamRole.LEADER) {
            throw new AppException("Bạn không phải là Trưởng nhóm", HttpStatus.FORBIDDEN);
        }

        // 2. Tìm thành viên được chỉ định làm Leader mới
        TeamMember newLeader = teamMemberRepository.findById(newLeaderId)
                .orElseThrow(() -> new AppException("Thành viên không tồn tại", HttpStatus.NOT_FOUND));

        if (!newLeader.getTeam().getId().equals(teamId)) {
            throw new AppException("Thành viên này không thuộc nhóm của bạn", HttpStatus.BAD_REQUEST);
        }

        // 3. Hoán đổi vai trò
        currentLeader.setRole(TeamRole.MEMBER);
        newLeader.setRole(TeamRole.LEADER);

        teamMemberRepository.save(currentLeader);
        teamMemberRepository.save(newLeader);
    }

    // --- 4. QUẢN LÝ ĐỀ TÀI & MILESTONE ---

    // Đăng ký đề tài
    @Transactional
    public Team registerProject(ProjectRegistrationRequest request) {
        User student = getCurrentUser();

        // Tìm quyền Leader của sinh viên
        TeamMember leadership = teamMemberRepository.findByStudent_IdAndRoleAndTeam_ClassRoom_Id(student.getId(), TeamRole.LEADER, request.getClassId())
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

    public List<ClassResponseDTO> getClassesAvailableForTeam() {
        User student = getCurrentUser();
        List<ClassRoom> classes = classRoomRepository.findClassesWithoutTeam(student.getId());

        // Map từ Entity sang DTO (giản lược để hiển thị trên Dropdown)
        return classes.stream().map(c -> ClassResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .semester(c.getSemester())
                .subjectName(c.getSubject() != null ? c.getSubject().getName() : "") 
                .classCode(c.getName()) 
                .build()
        ).toList();
    }

    // Lấy tất cả nhóm mà sinh viên đã tham gia
    public List<Team> getAllJoinedTeams() {
        User student = getCurrentUser();
        return teamMemberRepository.findByStudentIdWithEagerTeam(student.getId())
                .stream()
                .map(TeamMember::getTeam) // Lấy đối tượng Team từ TeamMember
                .toList();
    }

    // Lấy Milestone (Mốc thời gian)
    public List<Milestone> getClassMilestones(Long classId) {
        return milestoneRepository.findByClassRoom_Id(classId);
    }

    /**
    // Lấy thông tin chi tiết một nhóm theo ID và kiểm tra quyền truy cập của sinh viên hiện tại.
    @param teamId ID của nhóm cần lấy thông tin.
    @return Đối tượng Team nếu tìm thấy và sinh viên thuộc nhóm.
    @throws AppException nếu không tìm thấy nhóm (404) hoặc sinh viên không thuộc nhóm (403).
    */
    public Team getTeamById(Long teamId) {
        // 1. Lấy thông tin người dùng hiện tại 
        User currentUser = getCurrentUser();

        // 2. Tìm nhóm theo ID
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException("Nhóm không tồn tại!", HttpStatus.NOT_FOUND));

        // 3. Kiểm tra xem sinh viên có phải là thành viên của nhóm này không
        // Sử dụng TeamMemberRepository để xác thực quan hệ giữa Team và Student [cite: 2, 3]
        boolean isMember = teamMemberRepository.existsByTeam_IdAndStudent_Id(teamId, currentUser.getId());

        if (!isMember) {
            throw new AppException("Bạn không có quyền truy cập vào thông tin của nhóm này!", HttpStatus.FORBIDDEN);
        }

        return team;
    }
}