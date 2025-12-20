package com.cosre.backend.repository;

import com.cosre.backend.entity.TeamMember;
import com.cosre.backend.entity.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // Nhớ import List
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    boolean existsByTeam_IdAndStudent_Id(Long teamId, Long studentId);

    boolean existsByTeam_ClassRoom_IdAndStudent_Id(Long classId, Long studentId);

    Optional<TeamMember> findByStudent_IdAndRole(Long studentId, TeamRole role);

    // Method lấy điểm cá nhân (đã làm lúc nãy)
    Optional<TeamMember> findByStudent_IdAndTeam_Id(Long studentId, Long teamId);

    // --- BỔ SUNG METHOD NÀY ĐỂ FIX LỖI ---
    List<TeamMember> findByTeam_Id(Long teamId);
}