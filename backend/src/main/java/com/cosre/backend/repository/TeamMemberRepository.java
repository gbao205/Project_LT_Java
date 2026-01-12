package com.cosre.backend.repository;

import com.cosre.backend.entity.TeamMember;
import com.cosre.backend.entity.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    // Kiểm tra SV có trong nhóm cụ thể không (theo Team ID)
    boolean existsByTeam_IdAndStudent_Id(Long teamId, Long studentId);

    // Kiểm tra SV có trong lớp cụ thể không (theo Class ID)
    boolean existsByTeam_ClassRoom_IdAndStudent_Id(Long classId, Long studentId);

    // Kiểm tra xem user đã ở trong nhóm nào thuộc lớp classId chưa
    boolean existsByStudent_IdAndTeam_ClassRoom_Id(Long studentId, Long classId);
    
    // --- CÁC METHOD TỪ NHÁNH MAIN (Quản lý lớp học) ---

    // xác định chính xác quyền Leader trong lớp đang thao tác
    Optional<TeamMember> findByStudent_IdAndRoleAndTeam_ClassRoom_Id(Long studentId, TeamRole role, Long classId);

    // tìm tất cả các nhóm mà SV này làm Leader (ở mọi lớp)
    List<TeamMember> findByStudent_IdAndRole(Long studentId, TeamRole role);

    // Tìm thành viên trong lớp cụ thể
    Optional<TeamMember> findByStudent_IdAndTeam_ClassRoom_Id(Long studentId, Long classId);

    // Tìm thành viên dựa trên Team ID và User ID (trong entity TeamMember, field là 'student' kiểu User)
    Optional<TeamMember> findByTeam_IdAndStudent_Id(Long teamId, Long studentId);
    // --- CÁC METHOD TỪ NHÁNH ROLE-LECTURER (Chấm điểm & Quản lý nhóm) ---

    // Tìm thành viên cụ thể trong 1 nhóm (Dùng để chấm điểm cá nhân)
    Optional<TeamMember> findByStudent_IdAndTeam_Id(Long studentId, Long teamId);

    // Lấy danh sách thành viên của 1 team
    List<TeamMember> findByTeam_Id(Long teamId);

    // Tìm tất cả các nhóm mà studentId tham gia
    List<TeamMember> findByStudent_Id(Long studentId);
}