package com.cosre.backend.repository;

import com.cosre.backend.entity.Student;
import com.cosre.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // Tìm hồ sơ sinh viên dựa trên thực thể User
    Optional<Student> findByUser(User user);
    @Query("SELECT s FROM Student s JOIN FETCH s.user WHERE s.studentId = :studentId")
    Optional<Student> findByStudentId(@Param("studentId") String studentId);
    @Query(value = "SELECT s.* FROM students s " +
            "JOIN users u ON u.id = s.user_id " +
            "WHERE (:keyword IS NULL OR " +
            "u.full_name ILIKE CONCAT('%', :keyword, '%') OR " +
            "s.student_id ILIKE CONCAT('%', :keyword, '%'))",
            countQuery = "SELECT count(*) FROM students s JOIN users u ON u.id = s.user_id " +
                    "WHERE (:keyword IS NULL OR u.full_name ILIKE CONCAT('%', :keyword, '%') OR s.student_id ILIKE CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    Page<Student> searchStudents(@Param("keyword") String keyword, Pageable pageable);
}