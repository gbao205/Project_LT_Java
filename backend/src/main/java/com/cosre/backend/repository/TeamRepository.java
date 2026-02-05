package com.cosre.backend.repository;

import com.cosre.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    // Tìm tất cả các nhóm thuộc về một lớp học cụ thể
    Optional<Team> findByJoinCode(String joinCode);

    @Query("SELECT DISTINCT t FROM Team t " +
           "LEFT JOIN FETCH t.members " +
           "WHERE t.classRoom.id = :classRoomId")
    List<Team> findByClassRoom_Id(@Param("classRoomId") Long classRoomId);
}