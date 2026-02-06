package com.cosre.backend.repository;

import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 1. Tìm user theo Email (Thay vì Username)
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    // Hàm tìm User theo 1 Role cụ thể (Dùng cho trang Danh sách GV)
    List<User> findByRole(Role role);

    // Đếm số lượng theo Role (Dùng cho Thống kê Dashboard - số lượng giảng viên)
    long countByRole(Role role);

    // 2. Hàm tìm kiếm User (Cho chức năng quản lý)
    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    // 3. Đếm user active
    long countByActiveTrue();

    // 4. Lọc danh sách user theo Role (Cho chức năng CHAT)
    List<User> findByRoleIn(List<Role> roles);

    // 5. Lấy danh sách danh bạ để chat, sắp xếp theo thời gian tương tác gần nhất
    // Loại trừ chính mình (myEmail) khỏi danh sách
    // NULLS LAST: Đưa những người chưa tương tác bao giờ xuống cuối danh sách
    @Query("SELECT u FROM User u WHERE u.email <> :myEmail ORDER BY u.lastInteractionAt DESC NULLS LAST, u.fullName ASC")
    List<User> findAllContactsOrderByInteraction(@Param("myEmail") String myEmail);

    // Tìm tất cả User đang ở trong lớp (classId) NHƯNG chưa tham gia nhóm nào của lớp đó
    @Query("SELECT u FROM User u " +
            "WHERE u.id IN (" +
            // 1. Lấy tất cả User ID trong danh sách students của ClassRoom
            "SELECT student.id FROM ClassRoom c JOIN c.students student WHERE c.id = :classId" +
            ") " +
            "AND u.id NOT IN (" +
            // 2. Loại trừ những User ID đã nằm trong bảng TeamMember của lớp đó
            "SELECT tm.student.id FROM TeamMember tm " +
            "WHERE tm.team.classRoom.id = :classId" +
            ")")
    List<User> findUsersWithoutTeamInClass(@Param("classId") Long classId);
}