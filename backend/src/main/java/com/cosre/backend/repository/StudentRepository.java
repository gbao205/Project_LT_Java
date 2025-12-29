package com.cosre.backend.repository;

import com.cosre.backend.entity.Student;
import com.cosre.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // Tìm hồ sơ sinh viên dựa trên thực thể User
    Optional<Student> findByUser(User user);
}