package com.cosre.backend.repository;

import com.cosre.backend.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectCode(String subjectCode);
    boolean existsBySubjectCode(String subjectCode);
    @Query("""
        SELECT s FROM Subject s
        WHERE (:subjectCode IS NULL OR :subjectCode = '' OR s.subjectCode LIKE %:subjectCode%)
          AND (:name IS NULL OR :name = '' OR s.name LIKE %:name%)
          AND (:specialization IS NULL OR :specialization = '' OR s.specialization LIKE %:specialization%)
    """)
    Page<Subject> filter(
            String subjectCode,
            String name,
            String specialization,
            Pageable pageable
    );
}
