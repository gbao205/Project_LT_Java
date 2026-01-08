package com.cosre.backend.repository;

import com.cosre.backend.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    // Có thể thêm hàm tìm kiếm theo tên lớp nếu cần
    boolean existsByName(String name);

    boolean existsByClassCode(String classcode);

    List<ClassRoom> findByStudents_Email(String email);
    @Query("SELECT c FROM ClassRoom c WHERE c.lecturer.email = :email")
    List<ClassRoom> findByLecturerEmail(String email);

    @Query("SELECT COUNT(c) FROM ClassRoom c WHERE c.lecturer.email = :email")
    long countByLecturerEmail(String email);
}