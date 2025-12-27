package com.cosre.backend.repository;

import com.cosre.backend.entity.TeamMember;
import com.cosre.backend.entity.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    // 1. Kiểm tra sinh viên có trong nhóm nào đó chưa
    boolean existsByTeam_IdAndStudent_Id(Long teamId, Long studentId);

    // 2. Kiểm tra sinh viên đã tham gia nhóm nào trong Lớp học này chưa
    // Đi từ: TeamMember -> Team -> ClassRoom -> Id
    boolean existsByTeam_ClassRoom_IdAndStudent_Id(Long classId, Long studentId);

    // 3. Tìm thành viên theo Student và Role (để tìm nhóm trưởng)
    Optional<TeamMember> findByStudent_IdAndRole(Long studentId, TeamRole role);

    // Kiểm tra xem user đã ở trong nhóm nào thuộc lớp classId chưa
    boolean existsByStudent_IdAndTeam_ClassRoom_Id(Long studentId, Long classId);

    // Tìm thành viên trong lớp cụ thể
    Optional<TeamMember> findByStudent_IdAndTeam_ClassRoom_Id(Long studentId, Long classId);

    // Lấy danh sách thành viên của 1 team
    List<TeamMember> findByTeam_Id(Long teamId);

}