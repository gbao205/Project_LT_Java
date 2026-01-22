package com.cosre.backend.repository;

import com.cosre.backend.entity.Lecturer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer, Long> {
    Optional<Lecturer> findByCCCD(String cccd);
    boolean existsByCCCD(String cccd);
    @Query("SELECT l FROM Lecturer l LEFT JOIN l.user u WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            "LOWER(l.CCCD) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
    Page<Lecturer> searchLecturers(@Param("keyword") String keyword, Pageable pageable);
}