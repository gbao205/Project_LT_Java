package com.cosre.backend.controller;

import com.cosre.backend.dto.TeamMemberResponse;
import com.cosre.backend.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    // API lấy danh sách thành viên: GET /api/teams/{id}/members
    @GetMapping("/{id}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamMembers(id));
    }
}