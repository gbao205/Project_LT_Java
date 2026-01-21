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
    @Query(value = "SELECT l.* FROM lecturer l " +
            "JOIN users u ON u.id = l.user_id " +
            "WHERE (:keyword IS NULL OR " +
            "u.full_name ILIKE CONCAT('%', :keyword, '%') OR " +
            "l.cccd ILIKE CONCAT('%', :keyword, '%'))",
            countQuery = "SELECT count(*) FROM lecturer l JOIN users u ON u.id = l.user_id " +
                    "WHERE (:keyword IS NULL OR u.full_name ILIKE CONCAT('%', :keyword, '%') OR l.cccd ILIKE CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    Page<Lecturer> searchLecturers(@Param("keyword") String keyword, Pageable pageable);
}