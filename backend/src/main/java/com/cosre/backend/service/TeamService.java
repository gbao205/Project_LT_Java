package com.cosre.backend.service;

import com.cosre.backend.dto.TeamMemberResponse;
import com.cosre.backend.entity.TeamMember;
import com.cosre.backend.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamMemberRepository teamMemberRepository;

    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        // Tìm tất cả thành viên trong nhóm (Cần đảm bảo Repository có method findByTeam_Id)
        List<TeamMember> members = teamMemberRepository.findByTeam_Id(teamId);

        // Chuyển đổi từ Entity sang DTO
        return members.stream().map(m -> TeamMemberResponse.builder()
                        .id(m.getId())
                        .role(m.getRole().name())
                        .finalGrade(m.getFinalGrade())
                        .student(new TeamMemberResponse.StudentInfo(
                                m.getStudent().getId(),
                                m.getStudent().getFullName(), // Đảm bảo User entity có getFullName()
                                m.getStudent().getEmail(),
                                m.getStudent().getCode()      // Đảm bảo User entity có getCode()
                        ))
                        .build())
                .collect(Collectors.toList());
    }
}