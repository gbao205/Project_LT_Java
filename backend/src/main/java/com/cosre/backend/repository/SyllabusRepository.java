package com.cosre.backend.repository;

import com.cosre.backend.dto.staff.SyllabusListDTO;
import com.cosre.backend.entity.Syllabus;
import com.cosre.backend.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    Optional<Syllabus> findBySubjectSubjectCode(String subjectCode);

    @Query("""
SELECT s From Syllabus s
LEFT JOIN s.subject
WHERE (:id IS NULL OR s.id = :id)
  AND (:subjectName IS NULL OR s.subject.name LIKE %:subjectName%)
  AND (:year IS NULL OR s.year = :year)
""")
    Page<Syllabus> filter(
            Long id,
            String subjectName,
            Integer year,
            Pageable pageable);
}