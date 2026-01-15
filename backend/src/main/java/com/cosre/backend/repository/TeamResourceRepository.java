package com.cosre.backend.repository;

import com.cosre.backend.entity.TeamResource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeamResourceRepository extends JpaRepository<TeamResource, Long> {
    List<TeamResource> findByTeamId(Long teamId);
}