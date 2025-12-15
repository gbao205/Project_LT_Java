package com.cosre.backend.repository;

import com.cosre.backend.entity.TeamMember;
import com.cosre.backend.entity.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
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
}