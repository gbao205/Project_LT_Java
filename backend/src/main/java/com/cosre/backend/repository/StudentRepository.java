package com.cosre.backend.repository;

import com.cosre.backend.entity.Student;
import com.cosre.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // Tìm hồ sơ sinh viên dựa trên thực thể User
    Optional<Student> findByUser(User user);
    @Query("SELECT s FROM Student s JOIN FETCH s.user WHERE s.studentId = :studentId")
    Optional<Student> findByStudentId(@Param("studentId") String studentId);
    @Query("SELECT s FROM Student s LEFT JOIN s.user u WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            "LOWER(s.studentId) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
    Page<Student> searchStudents(@Param("keyword") String keyword, Pageable pageable);
    List<Student> findAllByStudentIdIn(Collection<String> studentIds);}