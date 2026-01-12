package com.cosre.backend.repository;

import com.cosre.backend.entity.ClassRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    @Query("""
        SELECT c FROM ClassRoom c
        LEFT JOIN c.subject s
        LEFT JOIN c.lecturer l
        WHERE (:id IS NULL OR c.id = :id)
          AND (:classCode IS NULL OR c.classCode LIKE %:classCode%)
          AND (:name IS NULL OR c.name LIKE %:name%)
          AND (:semester IS NULL OR c.semester = :semester)
          AND (:subjectName IS NULL OR s.name LIKE %:subjectName%)
          AND (:lecturerName IS NULL OR l.fullName LIKE %:lecturerName%)
          AND (:isRegistrationOpen IS NULL OR c.isRegistrationOpen = :isRegistrationOpen)
    """)
    Page<ClassRoom> filter(
            Long id,
            String classCode,
            String name,
            String semester,
            String subjectName,
            String lecturerName,
            Boolean isRegistrationOpen,
            Pageable pageable
    );


    // "Lấy các lớp (c) có sinh viên này (s) NHƯNG ID lớp đó KHÔNG nằm trong 
    // danh sách các lớp mà sinh viên này đang ở trong một nhóm (tm.team.classRoom.id)"
    @Query("SELECT c FROM ClassRoom c " +
           "JOIN c.students s " +
           "WHERE s.id = :studentId " +
           "AND c.id NOT IN (" +
           "    SELECT tm.team.classRoom.id FROM TeamMember tm " +
           "    WHERE tm.student.id = :studentId" +
           ")")
    List<ClassRoom> findClassesWithoutTeam(@Param("studentId") Long studentId);
}