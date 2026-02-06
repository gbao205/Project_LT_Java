package com.cosre.backend.repository;

import com.cosre.backend.entity.TeamMember;
import com.cosre.backend.entity.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    @Query("SELECT tm FROM TeamMember tm " +
           "JOIN FETCH tm.team t " +
           "LEFT JOIN FETCH t.classRoom cr " +
           "LEFT JOIN FETCH t.project p " +
           "LEFT JOIN FETCH t.members all_m " + // Lấy luôn các thành viên khác trong team để hiển thị
           "LEFT JOIN FETCH all_m.student " +    // Lấy thông tin user của các thành viên đó
           "WHERE tm.student.id = :studentId AND cr.id = :classId")
    Optional<TeamMember> findByStudent_IdAndTeam_ClassRoom_Id(@Param("studentId") Long studentId, @Param("classId") Long classId);

    // Tìm thành viên dựa trên Team ID và User ID (trong entity TeamMember, field là 'student' kiểu User)
    Optional<TeamMember> findByTeam_IdAndStudent_Id(Long teamId, Long studentId);
    // --- CÁC METHOD TỪ NHÁNH ROLE-LECTURER (Chấm điểm & Quản lý nhóm) ---

    // Tìm thành viên cụ thể trong 1 nhóm (Dùng để chấm điểm cá nhân)
    Optional<TeamMember> findByStudent_IdAndTeam_Id(Long studentId, Long teamId);

    // Lấy danh sách thành viên của 1 team  
    @Query("SELECT tm FROM TeamMember tm " +
           "JOIN FETCH tm.student s " +
           "WHERE tm.team.id = :teamId")
    List<TeamMember> findByTeam_Id(@Param("teamId") Long teamId);

    // Tìm tất cả các nhóm mà studentId tham gia
    List<TeamMember> findByStudent_Id(Long studentId);

    // Lấy thông tin TeamMember kèm theo thông tin Team (và các thông tin liên quan) dựa trên Student ID
    @Query("SELECT tm FROM TeamMember tm " +
           "JOIN FETCH tm.team t " + 
           "LEFT JOIN FETCH t.classRoom " + // Lấy luôn thông tin lớp học
           "LEFT JOIN FETCH t.project " +   // Lấy luôn thông tin đề tài
           "WHERE tm.student.id = :studentId")
    List<TeamMember> findByStudentIdWithEagerTeam(@Param("studentId") Long studentId);
}