package com.cosre.backend.repository;

import com.cosre.backend.entity.ClassRoom;
import com.cosre.backend.entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    // Tìm tất cả tài liệu thuộc về một lớp học cụ thể
    List<CourseMaterial> findByClassRoom(ClassRoom classRoom);

    // Cách 2: Tìm bằng ID lớp (Dự phòng, tiện hơn trong một số trường hợp)
    List<CourseMaterial> findByClassRoom_Id(Long classId);
}