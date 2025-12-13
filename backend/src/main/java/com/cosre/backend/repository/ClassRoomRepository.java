package com.cosre.backend.repository;

import com.cosre.backend.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    // Có thể thêm hàm tìm kiếm theo tên lớp nếu cần
    boolean existsByName(String name);
}