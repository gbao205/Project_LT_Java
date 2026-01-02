package com.cosre.backend.repository;

import com.cosre.backend.entity.Syllabus;
import com.cosre.backend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    Optional<Syllabus> findBySubject(Subject subject);
    Optional<Syllabus> findBySubjectSubjectCode(String subjectCode);
}