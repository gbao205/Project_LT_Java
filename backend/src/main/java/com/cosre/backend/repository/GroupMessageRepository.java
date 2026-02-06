package com.cosre.backend.repository;

import com.cosre.backend.entity.GroupMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    // Sử dụng JOIN FETCH để lấy kèm thông tin User (sender) trong 1 lần truy vấn
    @Query("SELECT m FROM GroupMessage m " +
           "JOIN FETCH m.sender " +
           "WHERE m.team.id = :teamId " +
           "ORDER BY m.timestamp DESC")
    List<GroupMessage> findRecentMessages(@Param("teamId") Long teamId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM GroupMessage m WHERE m.team.id = :teamId")
    void deleteAllByTeamId(@Param("teamId") Long teamId);
}