package com.cosre.backend.repository;

import com.cosre.backend.entity.Evaluation;
import com.cosre.backend.entity.EvaluationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByTeamId(Long teamId);

    // CHÚ Ý: AVG trả về Double, ta sẽ convert sang BigDecimal ở Service sau
    @Query("SELECT AVG(e.score) FROM Evaluation e WHERE e.team.id = :teamId AND e.type = :type")
    Double findAverageScoreByTeamIdAndType(@Param("teamId") Long teamId, @Param("type") EvaluationType type);

    @Query("SELECT AVG(e.score) FROM Evaluation e WHERE e.student.id = :studentId AND e.team.id = :teamId AND e.type = :type")
    Double findAverageScoreByStudentAndTeamAndType(@Param("studentId") Long studentId,
                                                   @Param("teamId") Long teamId,
                                                   @Param("type") EvaluationType type);
}