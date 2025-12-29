package com.cosre.backend.repository;

import com.cosre.backend.entity.TeamMember;
import com.cosre.backend.entity.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    // Tìm thành viên theo Student và Role (để tìm nhóm trưởng)
    Optional<TeamMember> findByStudent_IdAndRole(Long studentId, TeamRole role);

    // Kiểm tra xem user đã ở trong nhóm nào thuộc lớp classId chưa
    boolean existsByStudent_IdAndTeam_ClassRoom_Id(Long studentId, Long classId);

    // Tìm thành viên trong lớp cụ thể
    Optional<TeamMember> findByStudent_IdAndTeam_ClassRoom_Id(Long studentId, Long classId);

    // Tìm thành viên dựa trên Team ID và User ID (trong entity TeamMember, field là 'student' kiểu User)
    Optional<TeamMember> findByTeam_IdAndStudent_Id(Long teamId, Long studentId);
}