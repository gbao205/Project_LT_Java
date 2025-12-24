package com.cosre.backend.repository;

import com.cosre.backend.entity.Student;
import com.cosre.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    // Tìm hồ sơ sinh viên dựa trên thực thể User
    Optional<Student> findByUser(User user);

    // Kiểm tra tồn tại theo mã số sinh viên
    boolean existsByStudentId(String studentId);
}